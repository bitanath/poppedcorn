import os
import re
import cv2
import json
import torch

import blend_modes
import numpy as np
import pymeanshift as pms

from kornia.contrib import EdgeDetector

from torchvision import transforms
from PIL import Image,ImageOps
from PIL.ImageOps import grayscale
from pixelart import Pixelit

def convertWhiteToTransparent(img):
    img = img.convert("RGBA")
    pixdata = img.load()
    width, height = img.size
    for y in range(height):
        for x in range(width):
            if pixdata[x, y] == (255, 255, 255, 255):
                pixdata[x, y] = (255, 255, 255, 0)
    return img

def erode(image,radius=5,iterations=2):
    img = np.array(image)
    kernel = np.ones((radius,radius),np.uint8)
    erosion = cv2.erode(img,kernel,iterations = iterations)
    return Image.fromarray(erosion)

def dilate(image,radius=5,iterations=2):
    img = np.array(image)
    kernel = np.ones((radius,radius),np.uint8)
    erosion = cv2.dilate(img,kernel,iterations = iterations)
    return Image.fromarray(erosion)

def seamlessClone(image,background,mask):
    monoMaskImage = cv2.split(np.array(mask))[0] # reducing the mask to a monochrome
    br = cv2.boundingRect(monoMaskImage) # bounding rect (x,y,width,height)
    centerOfBR = (br[0] + br[2] // 2, br[1] + br[3] // 2)

    seamlessclone = cv2.seamlessClone(np.array(image), np.array(background), np.array(mask), centerOfBR, cv2.NORMAL_CLONE)
    return Image.fromarray(seamlessclone)


# NOTE: Custom function to take poster and thumbnail and merge them together while also processing the image
def stylize(imgpath,thumbpath,birefnet):
    img = Image.open(imgpath)
    background = Image.new("RGB",(1024,1024),0)
    resized = img.resize((1024,332))
    background.paste(resized,(0,0))
    tensor = transforms.ToTensor()(background).unsqueeze(0)
    with torch.no_grad():
        masked = birefnet(tensor)
        mask = transforms.ToPILImage()(masked[-1].sigmoid().squeeze())
        mask = mask.crop((0,0,1024,332)).resize((1280,416))
    arrayed = np.array(mask)
    non_zero_pixels = np.argwhere(arrayed > 0)

    if len(non_zero_pixels) > 0:
        centroid_x = np.mean(non_zero_pixels[:, 1])  # x-coordinate from top-left
        centroid_y = np.mean(non_zero_pixels[:, 0])  # y-coordinate also from top left
        ltr = centroid_x/640

    composited = img
    style_mask = Image.open("assets/stylemask.png").convert("L")
    styled = Image.composite(composited.convert("RGBA"),Image.new("RGBA",img.size,(0,0,0,0)),style_mask)
    
    popcorn_name = thumbpath
    popcorn = Image.open(popcorn_name).convert("RGBA")
    popcorn.thumbnail((512,512))
    if(ltr <= 1.):
        styled.paste(popcorn,(1280-416,-50),mask=popcorn)
    else:
        if("agree" in popcorn_name or "applause" in popcorn_name or "very-pissed" in popcorn_name or "warning" in popcorn_name or "stop-sign" in popcorn_name or "laughing" in popcorn_name or "rich" in popcorn_name or "treasure" in popcorn_name):
            mirrored = popcorn
            offset = 0
        else:
            mirrored = ImageOps.mirror(popcorn)
            offset = -50
        styled.paste(mirrored,(offset,-50),mask=mirrored)

    pmsegmenter = pms.Segmenter()
    pmsegmenter.spatial_radius = 2
    pmsegmenter.range_radius = 1.25
    pmsegmenter.min_density = 20

    (segmented_image, labels_image, number_regions) = pmsegmenter(styled.convert("RGB"))
    smoothed = Image.fromarray(segmented_image)

    chonked = Image.composite(styled,Image.new("RGBA",img.size,(0,0,0,0)),styled)

    pixellator = Pixelit(smoothed.convert("RGB"),{"palette":0,"scale":40})
    pixellated = pixellator.pixelate().convert_palette().get_image()
    (segmented_image, labels_image, number_regions) = pmsegmenter(pixellated.convert("RGB"))
    smoothed = Image.fromarray(segmented_image)
    
    blended = Image.fromarray(blend_modes.multiply(np.array(smoothed.convert("RGBA"))*1.0,np.array(styled.convert("RGBA"))*1.0,0.5).astype("uint8"))
    finalized = Image.composite(blended,Image.new("RGBA",img.size,(0,0,0,0)),styled)
    
    return (styled,finalized,chonked)