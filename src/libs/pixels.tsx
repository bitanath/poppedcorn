import {Devvit} from '@devvit/public-api'

// Glyphs are defined below
type SupportedGlyphs = keyof typeof Glyphs;

type Glyph = {
  path: string;
  width: number;
  height: number;
};

interface PixelTextProps {
  children: string;
  size?: number;
  color?: string;
}

export function PixelText(props: PixelTextProps): JSX.Element {
  const { children, size = 2, color = 'black' } = props;
  const line = children[0].split('');
  const gap = 1;
  const height = Glyphs['A'].height;
  let width = 0;
  let xOffset = 0;

  const characters: string[] = [];

  line.forEach((character) => {
    if (character === ' ') {
      xOffset += 6 + gap;
      return;
    }

    const glyph: Glyph = Glyphs[character as SupportedGlyphs];
    if (!glyph) {
      return;
    }
    characters.push(`<path
      d="${glyph.path}"
      transform="translate(${xOffset} 0)"
      fill="${props.color}"
      fill-rule="evenodd"
      clip-rule="evenodd"
    />`);

    xOffset += glyph.width + gap;
    width = xOffset;
  });

  // Remove the trailing gap
  width -= gap;

  const scaledHeight: Devvit.Blocks.SizeString = `${height * size}px`;
  const scaledWidth: Devvit.Blocks.SizeString = `${width * size}px`;

  return (
    <image
      imageHeight={height}
      imageWidth={width}
      height={scaledHeight}
      width={scaledWidth}
      description={children[0]}
      resizeMode="fill"
      url={`data:image/svg+xml;charset=UTF-8,
        <svg
            width="${width}"
            height="${height}"
            viewBox="0 0 ${width} ${height}"
            fill="${color}"
            xmlns="http://www.w3.org/2000/svg"
        >
        ${characters.join('')}
        </svg>
      `}
    />
  );
}

interface GlyphChar {
  path: string;
  width: number;
  height: number;
}

interface GlyphMap {
  [key: string]: GlyphChar;
}

export const Glyphs:GlyphMap = {
    "0": {
      "path": "M5 0H1V1H0V5H1V6H5V5H6V1H5V0ZM4 1H2V3H3V4H2V5H4V3H3V2H4V1Z",
      "width": 6,
      "height": 7
    },
    "1": {
      "path": "M4 0H2V1H1V2H2V5H0V6H6V5H4V0Z",
      "width": 6,
      "height": 7
    },
    "2": {
      "path": "M1 0H5V1H6V2H5V3H4V4H3V5H6V6H0V5H1V4H2V3H3V2H4V1H2V2H0V1H1V0Z",
      "width": 6,
      "height": 7
    },
    "3": {
      "path": "M0 0H6V1H5V2H4V3H5V4H6V5H5V6H1V5H0V4H2V5H4V4H3V3H2V2H3V1H0V0Z",
      "width": 6,
      "height": 7
    },
    "4": {
      "path": "M5 0H3V1H2V2H1V3H0V5H3V6H5V5H6V4H5V0ZM2 3V4H3V3H2Z",
      "width": 6,
      "height": 7
    },
    "5": {
      "path": "M6 0H0V3H4V5H2V4H0V5H1V6H5V5H6V3H5V2H2V1H6V0Z",
      "width": 6,
      "height": 7
    },
    "6": {
      "path": "M1 0H5V1H2V2H5V3H6V5H5V6H1V5H0V1H1V0ZM2 5H4V3H2V5Z",
      "width": 6,
      "height": 7
    },
    "7": {
      "path": "M0 0H6V2H5V3H4V4H3V6H1V4H2V3H3V2H4V1H0V0Z",
      "width": 6,
      "height": 7
    },
    "8": {
      "path": "M5 0H1V1H0V2H1V3H0V5H1V6H5V5H6V3H5V2H6V1H5V0ZM4 5V3H2V5H4ZM4 2H2V1H4V2Z",
      "width": 6,
      "height": 7
    },
    "9": {
      "path": "M1 0H5V1H6V4H5V5H4V6H1V5H3V4H4V3H1V2H0V1H1V0ZM2 2H4V1H2V2Z",
      "width": 6,
      "height": 7
    },
    "A": {
      "path": "M2 0H4V1H5V2H6V6H4V5H2V6H0V2H1V1H2V0ZM2 2V4H4V2H2Z",
      "width": 6,
      "height": 7
    },
    "B": {
      "path": "M5 0H0V6H5V5H6V3H5V2H6V1H5V0ZM4 3H2V5H4V3ZM2 2V1H4V2H2Z",
      "width": 6,
      "height": 7
    },
    "C": {
      "path": "M1 0H5V1H6V2H4V1H2V5H4V4H6V5H5V6H1V5H0V1H1V0Z",
      "width": 6,
      "height": 7
    },
    "D": {
      "path": "M4 0H0V6H4V5H5V4H6V2H5V1H4V0ZM4 2H3V1H2V5H3V4H4V2Z",
      "width": 6,
      "height": 7
    },
    "E": {
      "path": "M6 0H0V6H6V5H2V3H5V2H2V1H6V0Z",
      "width": 6,
      "height": 7
    },
    "F": {
      "path": "M0 0H6V1H2V2H5V3H2V6H0V0Z",
      "width": 6,
      "height": 7
    },
    "G": {
      "path": "M1 0H6V1H2V5H4V4H3V3H6V6H1V5H0V1H1V0Z",
      "width": 6,
      "height": 7
    },
    "H": {
      "path": "M0 0H2V2H4V0H6V6H4V3H2V6H0V0Z",
      "width": 6,
      "height": 7
    },
    "I": {
      "path": "M0 0H6V1H4V5H6V6H0V5H2V1H0V0Z",
      "width": 6,
      "height": 7
    },
    "J": {
      "path": "M6 0H4V5H2V4H0V5H1V6H5V5H6V0Z",
      "width": 6,
      "height": 7
    },
    "K": {
      "path": "M2 0H0V6H2V4H3V5H4V6H6V5H5V4H4V2H5V1H6V0H4V1H3V2H2V0Z",
      "width": 6,
      "height": 7
    },
    "L": {
      "path": "M2 0H0V6H6V5H2V0Z",
      "width": 6,
      "height": 7
    },
    "M": {
      "path": "M0 0H2V1H3V2H4V1H5V0H7V6H5V3H4V4H3V3H2V6H0V0Z",
      "width": 7,
      "height": 7
    },
    "N": {
      "path": "M0 0H2V1H3V2H4V0H6V6H4V5H3V4H2V6H0V0Z",
      "width": 6,
      "height": 7
    },
    "O": {
      "path": "M5 0H1V1H0V5H1V6H5V5H6V1H5V0ZM4 1H2V5H4V1Z",
      "width": 6,
      "height": 7
    },
    "P": {
      "path": "M0 0V6H2V4H5V3H6V1H5V0H0ZM2 1V3H4V1H2Z",
      "width": 6,
      "height": 7
    },
    "Q": {
      "path": "M5 0H1V1H0V5H1V6H3V5H4V6H6V5H5V4H6V1H5V0ZM4 1H2V5H3V4H4V1Z",
      "width": 6,
      "height": 7
    },
    "R": {
      "path": "M0 0V6H2V4H3V5H4V6H6V5H5V3H6V1H5V0H0ZM4 1H2V3H4V1Z",
      "width": 6,
      "height": 7
    },
    "S": {
      "path": "M1 0H5V1H2V2H5V3H6V5H5V6H1V5H4V3H1V2H0V1H1V0Z",
      "width": 6,
      "height": 7
    },
    "T": {
      "path": "M6 0H0V1H2V6H4V1H6V0Z",
      "width": 6,
      "height": 7
    },
    "U": {
      "path": "M0 0H2V5H4V0H6V6H0V0Z",
      "width": 6,
      "height": 7
    },
    "V": {
      "path": "M2 0H0V4H1V5H2V6H4V5H5V4H6V0H4V4H2V0Z",
      "width": 6,
      "height": 7
    },
    "W": {
      "path": "M0 0H2V3H3V2H4V3H5V0H7V6H5V5H4V4H3V5H2V6H0V0Z",
      "width": 7,
      "height": 7
    },
    "X": {
      "path": "M0 0H2V2H4V0H6V2H5V4H6V6H4V4H2V6H0V4H1V2H0V0Z",
      "width": 6,
      "height": 7
    },
    "Y": {
      "path": "M2 0H0V2H1V3H2V6H4V3H5V2H6V0H4V2H2V0Z",
      "width": 6,
      "height": 7
    },
    "Z": {
      "path": "M6 0H0V1H3V2H2V3H1V4H0V6H6V5H2V4H3V3H4V2H5V1H6V0Z",
      "width": 6,
      "height": 7
    },
    "a": {
      "path": "M1 1H5V2H6V6H1V5H0V4H1V3H4V2H1V1ZM2 4V5H4V4H2Z",
      "width": 6,
      "height": 7
    },
    "b": {
      "path": "M2 0H0V6H5V5H6V3H5V2H2V0ZM4 3H2V5H4V3Z",
      "width": 6,
      "height": 7
    },
    "c": {
      "path": "M1 1H5V2H2V5H5V6H1V5H0V2H1V1Z",
      "width": 5,
      "height": 7
    },
    "d": {
      "path": "M6 0H4V2H1V3H0V5H1V6H6V0ZM2 5H4V3H2V5Z",
      "width": 6,
      "height": 7
    },
    "e": {
      "path": "M1 1H5V2H6V4H2V5H5V6H1V5H0V2H1V1ZM2 3H4V2H2V3Z",
      "width": 6,
      "height": 7
    },
    "f": {
      "path": "M5 0H2V1H1V2H0V3H1V6H3V3H5V2H3V1H5V0Z",
      "width": 5,
      "height": 7
    },
    "g": {
      "path": "M1 1H6V6H5V7H0V6H4V5H1V4H0V2H1V1ZM2 4H4V2H2V4Z",
      "width": 6,
      "height": 7
    },
    "h": {
      "path": "M0 0H2V2H5V3H6V6H4V3H2V6H0V0Z",
      "width": 6,
      "height": 7
    },
    "i": {
      "path": "M3 2V0H1V1H3V2H0V3H1V5H0V6H4V5H3V2Z",
      "width": 4,
      "height": 7
    },
    "j": {
      "path": "M3 2V0H5V1H3V2H5V6H4V7H0V6H3V2Z",
      "width": 5,
      "height": 7
    },
    "k": {
      "path": "M0 0H2V3H3V2H5V3H4V4H5V5H6V6H4V5H3V4H2V6H0V0Z",
      "width": 6,
      "height": 7
    },
    "l": {
      "path": "M0 0H3V5H4V6H0V5H1V1H0V0Z",
      "width": 4,
      "height": 7
    },
    "m": {
      "path": "M0 1H2V2H4V1H6V2H7V6H5V4H4V5H3V4H2V6H0V1Z",
      "width": 7,
      "height": 7
    },
    "n": {
      "path": "M0 1H5V2H6V6H4V2H2V6H0V1Z",
      "width": 6,
      "height": 7
    },
    "o": {
      "path": "M1 1H5V2H6V5H5V6H1V5H0V2H1V1ZM2 5H4V2H2V5Z",
      "width": 6,
      "height": 7
    },
    "p": {
      "path": "M0 1V7H2V5H5V4H6V2H5V1H0ZM2 2V4H4V2H2Z",
      "width": 6,
      "height": 7
    },
    "q": {
      "path": "M6 1H1V2H0V4H1V5H4V7H6V1ZM2 2V4H4V2H2Z",
      "width": 6,
      "height": 7
    },
    "r": {
      "path": "M0 1H5V2H6V3H4V2H2V6H0V1Z",
      "width": 6,
      "height": 7
    },
    "s": {
      "path": "M1 1H6V2H2V3H5V4H6V5H5V6H0V5H4V4H1V3H0V2H1V1Z",
      "width": 6,
      "height": 7
    },
    "t": {
      "path": "M4 0H2V1H0V2H2V5H3V6H6V5H4V2H6V1H4V0Z",
      "width": 6,
      "height": 7
    },
    "u": {
      "path": "M0 1H2V5H4V1H6V6H1V5H0V1Z",
      "width": 6,
      "height": 7
    },
    "v": {
      "path": "M2 1H0V4H1V5H2V6H4V5H5V4H6V1H4V4H2V1Z",
      "width": 6,
      "height": 7
    },
    "w": {
      "path": "M0 1H2V3H3V2H4V3H5V1H7V4H6V6H4V5H3V6H1V4H0V1Z",
      "width": 7,
      "height": 7
    },
    "x": {
      "path": "M0 1H2V2H4V1H6V2H5V3H4V4H5V5H6V6H4V5H2V6H0V5H1V4H2V3H1V2H0V1Z",
      "width": 6,
      "height": 7
    },
    "y": {
      "path": "M0 1H2V4H4V1H6V5H5V6H4V7H0V6H3V5H1V4H0V1Z",
      "width": 6,
      "height": 7
    },
    "z": {
      "path": "M0 1H6V2H5V3H4V4H3V5H6V6H0V5H1V4H2V3H3V2H0V1Z",
      "width": 6,
      "height": 7
    },
    "_": {
      "path": "M0 5V6H6V5H0Z",
      "width": 6,
      "height": 7
    },
    "-": {
      "path": "M0 3V4H6V3H0Z",
      "width": 6,
      "height": 7
    },
    ".": {
      "path": "M0 4V6H2V4H0Z",
      "width": 2,
      "height": 7
    },
    ",": {
      "path": "M3 4H1V6H0V7H2V6H3V4Z",
      "width": 3,
      "height": 7
    },
    "(": {
      "path": "M5 0H2V1H1V2H0V4H1V5H2V6H5V5H4V4H2V2H4V1H5V0Z",
      "width": 5,
      "height": 7
    },
    ")": {
      "path": "M3 0H0V1H1V2H3V4H1V5H0V6H3V5H4V4H5V2H4V1H3V0Z",
      "width": 5,
      "height": 7
    },
    "<": {
      "path": "M4 0H3V1H2V2H1V3H2V4H3V5H4V4H3V3H2V3H3V2H4V1H4V0Z",
      "width": 6,
      "height": 6
    },
    ">": {
      "path": "M2 0H3V1H4V2H5V3H4V4H3V5H2V4H3V3H4V3H3V2H2V1H2V0Z",
      "width": 5,
      "height": 7
    },
    "!": {
      "path": "M2 0H0V4V6H2V5H0V4H2V0Z",
      "width": 2,
      "height": 7
    },
    "+": {
      "path": "M2 1H4V3H6V4H4V6H2V4H0V3H2V1Z",
      "width": 6,
      "height": 7
    },
    "*": {
      "path": "M1 1H3V2H5V1H7V2H6V3H8V4H6V5H7V6H5V5H3V6H1V5H2V4H0V3H2V2H1V1Z",
      "width": 8,
      "height": 7
    },
    "?": {
      "path": "M5 0H1V1H0V2H2V1H4V2H3V3H2V4V6H4V5H2V4H4V3H5V2H6V1H5V0Z",
      "width": 6,
      "height": 7
    },
    "/": {
      "path": "M4 0L1 6H0L3 0H4Z",
      "width": 6,
      "height": 7
    },
    "%": {
      "path": "M4.2 0.6h0.6l-3 4.8h-0.6L4.2 0.6zM3.2 0.6a0.6 0.6 0 1 1-1.2 0 0.6 0.6 0 0 1 1.2 0zM4 5.4a0.6 0.6 0 1 1-1.2 0 0.6 0.6 0 0 1 1.2 0z",
      "width": 5,
      "height": 7
    },
  }
  