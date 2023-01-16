#!/usr/bin/python3

# convert 'orig_image.jpg' -resize 640x360 -gravity Center -crop 640x360+0+0 'changed_image.jpg'
import sys
import subprocess
import os


def convert(inFile, outFilePng, outFileRaw):
    tempFilePng = outFilePng + "t";
    subprocess.check_output(["make", "-C", os.path.dirname(__file__)])
    subprocess.check_output(["cp", inFile, tempFilePng])
    try:
        width, height = list(map(float, str(subprocess.check_output(["identify", tempFilePng])).split(" ")[2].split("x")))
    except subprocess.CalledProcessError as e:
        raise Exception("Error while opening input file")
    
    subprocess.check_output(["rm", tempFilePng])

    aspect_ratio = width / height
    desired_aspect_ratio = 600.0 / 448.0

    # It is too tall
    if aspect_ratio < desired_aspect_ratio:
        # So fixed width
        height = width / desired_aspect_ratio;
    # it is too long or perfect
    else:
        # So fixed height
        width = height * desired_aspect_ratio;

    cropWidth = int(width)
    cropHeight = int(height)

    cmd = ["convert", inFile, "-gravity", "Center", "-crop", f"{cropWidth}x{cropHeight}+0+0", "-resize", "600x448!", outFilePng]
    print(" ".join(cmd))

    try:
        subprocess.check_output(cmd)
    except subprocess.CalledProcessError as e:
        raise Exception("Error while resizing/cropping with ImageMagick")
        # print(e)
        # exit(-1)

    # Do dithering
    try:
        subprocess.check_output([f"{os.path.dirname(__file__)}/dither", outFilePng, ".tmp.png"])
    except subprocess.CalledProcessError as e:
        raise Exception("Error while dithering image: ")
        # print(e);
        # exit(-1)

    # Convert dithered image to a format understood by the e-ink display
    try:
        subprocess.check_output([f"{os.path.dirname(__file__)}/converter", ".tmp.png", outFileRaw])
    except subprocess.CalledProcessError as e:
        raise Exception("Error while converting to E-Ink format")
        print(e)
        exit(-1)

    subprocess.check_output(["rm", ".tmp.png"])

if __name__ == "__main__":
    args = 3;
    
    if len(sys.argv) != 1 + args:
        print("Usage: imageToEInk.py [inputFile] [outputPng] [outputRaw]")
        exit(-1)
    
    inFile = sys.argv[1]
    outFilePng = sys.argv[2]
    outFileRaw = sys.argv[3]

    try:
        convert()
    except Exception as e:
        print(e)
        exit(-1)
