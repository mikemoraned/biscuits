# Import the cv2 library
import cv2
import json
import numpy as np

# Read the image you want connected components of
src = cv2.imread('edinburgh.png')
# Convert to grayscale
src_grey = cv2.cvtColor(src, cv2.COLOR_BGR2GRAY)
# Threshold it so it becomes binary
ret, thresh = cv2.threshold(src_grey,0,255,cv2.THRESH_BINARY+cv2.THRESH_OTSU)
# You need to choose 4 or 8 for connectivity type
connectivity = 4
# Perform the operation
output = cv2.connectedComponentsWithStats(thresh, connectivity, cv2.CV_32S)
# Get the results
# The first cell is the number of labels
num_labels = output[0]
# The second cell is the label matrix
labels = output[1]
# The third cell is the stat matrix
stats = output[2]
# The fourth cell is the centroid matrix
centroids = output[3]

data = []
for index, stat in enumerate(stats):
    x = stat[0]
    y = stat[1]
    width = stat[2]
    height = stat[3]
    data.append({
        'x': np.asscalar(x),
        'y': np.asscalar(y),
        'width': np.asscalar(width),
        'height': np.asscalar(height),
        'id': index,
    })
    label = src.copy()
    label = label[y:(y + height), x:(x + width)]
    label_masked = cv2.cvtColor(label, cv2.COLOR_BGR2BGRA)
    label_mask = labels[y:(y + height), x:(x + width)]
    black_transparent = np.array([0, 0, 0, 0])
    black_opaque = np.array([0, 0, 0, 255])
    for y in range(height):
        for x in range(width):
            if label_mask[y, x] != index:
                label_masked[y, x] = black_transparent
            else:
                label_masked[y, x] = black_opaque
    cv2.imwrite('edinburgh.label_%s.png' % index, label_masked)

cv2.imwrite('edinburgh.labels.png', labels)
with open('edinburgh.labels.json', 'w') as f:
    json.dump(data, f, indent=4)

