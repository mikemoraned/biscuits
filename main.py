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
for stat in stats:
    cv2.rectangle(labels, (stat[0], stat[1]), (stat[2] + stat[0], stat[3] + stat[1]), (0, 255, 0), 3)
    data.append({
        'x': np.asscalar(stat[0]),
        'y': np.asscalar(stat[1]),
        'width': np.asscalar(stat[2]),
        'height': np.asscalar(stat[3]),
    })

for centroid in centroids:
    cv2.circle(labels, (int(centroid[0]), int(centroid[1])), 2, (255, 0, 0))

cv2.imwrite('edinburgh.labels.png', labels)
with open('edinburgh.labels.json', 'w') as f:
    json.dump(data, f, indent=4)

