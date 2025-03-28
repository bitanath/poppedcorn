##TODO: A python translation of https://github.com/giventofly/pixelit 
##Is not designed to be efficient and does not use the GPU
##Intended to aesthetically pixellate movie posters

from PIL import Image
import numpy as np
import math

class Pixelit:
    def __init__(self, image, config=None):
        if config is None:
            config = {}
        
        scale = config.get('scale', 100)
        self.scale = scale * 0.01 if scale > 0 and scale <= 100 else 100 * 0.01
        
        self.palettes = [
             [
                [102, 51, 153],     
                [255, 221, 0],      
                [230, 230, 250],    
                [255, 215, 0],      
                [142, 69, 133],     
                [148, 0, 211],      
                [204, 204, 255],    # Periwinkle
                [190, 140, 70],     #amber yellow
                [229, 38, 38]      #popcorn red
            ],
            [   
                [7, 5, 5],
                [33, 25, 25],
                [82, 58, 42],
                [138, 107, 62],
                [193, 156, 77],
                [234, 219, 116],
                [160, 179, 53],
                [83, 124, 68],
                [66, 60, 86],
                [89, 111, 175],
                [107, 185, 182],
                [251, 250, 249],
                [184, 170, 176],
                [121, 112, 126],
                [148, 91, 40],
            ],
            [
                [13, 43, 69],
                [32, 60, 86],
                [84, 78, 104],
                [141, 105, 122],
                [208, 129, 89],
                [255, 170, 94],
                [255, 212, 163],
                [255, 236, 214],
            ],
            [
                [43, 15, 84],
                [171, 31, 101],
                [255, 79, 105],
                [255, 247, 248],
                [255, 129, 66],
                [255, 218, 69],
                [51, 104, 220],
                [73, 231, 236],
            ],
            [
                [48, 0, 48],
                [96, 40, 120],
                [248, 144, 32],
                [248, 240, 136],
                [190, 140, 70], #amber yellow
                [229, 38, 38], #popcorn red
            ],
            [
                [239, 26, 26],
                [172, 23, 23],
                [243, 216, 216],
                [177, 139, 139],
                [53, 52, 65],
                [27, 26, 29],
                [248, 144, 32],
                [190, 140, 70],
                [248, 240, 136]
            ],
            [
                [26, 28, 44],
                [93, 39, 93],
                [177, 62, 83],
                [239, 125, 87],
                [255, 205, 117],
                [167, 240, 112],
                [56, 183, 100],
                [37, 113, 121],
                [41, 54, 111],
                [59, 93, 201],
                [65, 166, 246],
                [115, 239, 247],
                [244, 244, 244],
                [148, 176, 194],
                [86, 108, 134],
                [51, 60, 87],
            ],
            [
                [44, 33, 55],
                [118, 68, 98],
                [237, 180, 161],
                [169, 104, 104],
            ],

            [
                [171, 97, 135],
                [235, 198, 134],
                [216, 232, 230],
                [101, 219, 115],
                [112, 157, 207],
                [90, 104, 125],
                [33, 30, 51],
            ],
            [
                [140, 143, 174],
                [88, 69, 99],
                [62, 33, 55],
                [154, 99, 72],
                [215, 155, 125],
                [245, 237, 186],
                [192, 199, 65],
                [100, 125, 52],
                [228, 148, 58],
                [157, 48, 59],
                [210, 100, 113],
                [112, 55, 127],
                [126, 196, 193],
                [52, 133, 157],
                [23, 67, 75],
                [31, 14, 28],
            ],
            [
                [94, 96, 110],
                [34, 52, 209],
                [12, 126, 69],
                [68, 170, 204],
                [138, 54, 34],
                [235, 138, 96],
                [0, 0, 0],
                [92, 46, 120],
                [226, 61, 105],
                [170, 92, 61],
                [255, 217, 63],
                [181, 181, 181],
                [255, 255, 255],
            ],
            [
                [49, 31, 95],
                [22, 135, 167],
                [31, 213, 188],
                [237, 255, 177],
            ],
            [
                [21, 25, 26],
                [138, 76, 88],
                [217, 98, 117],
                [230, 184, 193],
                [69, 107, 115],
                [75, 151, 166],
                [165, 189, 194],
                [255, 245, 247],
            ],
        ]
        
        self.palette = self.palettes[config.get('palette', 0)]
        self.max_height = config.get('maxHeight')
        self.max_width = config.get('maxWidth')
        self.image = image 
        self.end_color_stats = {} 

    def get_image(self):
        return self.image
    
    def color_sim(self, rgb_color, compare_color):
        d = sum((rgb_color[i] - compare_color[i]) ** 2 for i in range(len(rgb_color)))
        return math.sqrt(d)
    
    def similar_color(self, actual_color):
        selected_color = []
        current_sim = self.color_sim(actual_color, self.palette[0])
        
        for color in self.palette:
            next_color = self.color_sim(actual_color, color)
            if next_color <= current_sim:
                selected_color = color
                current_sim = next_color
        
        return selected_color
    
    def pixelate(self):
        if not self.image:
            if hasattr(self.drawfrom, 'filename'):
                self.image = Image.open(self.drawfrom.filename)
            else:
                return self
        
        width, height = self.image.size
        
        scaled_w = int(width * self.scale)
        scaled_h = int(height * self.scale)
        
        temp_image = self.image.resize((scaled_w, scaled_h), Image.NEAREST)
        self.image = temp_image.resize((width, height), Image.NEAREST)
        
        return self #TODO chain in order to perform further operations like palette changing
    
    def convert_grayscale(self):
        if self.image:
            self.image = self.image.convert('L').convert('RGB')
        
        return self
    
    def convert_palette(self):
        if not self.image:
            return self
            
        img_array = np.array(self.image)
        height, width, _ = img_array.shape
        
        for y in range(height):
            for x in range(width):
                pixel = img_array[y, x].tolist()
                final_color = self.similar_color(pixel)
                img_array[y, x] = final_color
        
        self.image = Image.fromarray(img_array.astype('uint8'))
        
        return self
    
    def resize_image(self):
        
        if not self.image:
            return self
            
        if not self.max_width and not self.max_height:
            return self
            
        width, height = self.image.size
        ratio = 1.0
        
        if self.max_width and width > self.max_width:
            ratio = self.max_width / width
            
        # Max height overrides max width
        if self.max_height and height > self.max_height:
            ratio = self.max_height / height
            
        if ratio != 1.0:
            new_width = int(width * ratio)
            new_height = int(height * ratio)
            self.image = self.image.resize((new_width, new_height), Image.LANCZOS)
            
        return self