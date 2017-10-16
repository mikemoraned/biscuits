# Import the cv2 library
import cv2
import json
import numpy as np

# for city_name in ["edinburgh", "newyork", "budapest"]:
# for city_name in ["jerusalem"]:
for city_name in ["au"]:
#for city_name in ["jerusalem", "edinburgh", "newyork", "budapest"]:
    print("Doing {}".format(city_name))

    # Read the image you want connected components of
    src = cv2.imread("{}.png".format(city_name))
    # Convert to grayscale
    src_grey = cv2.cvtColor(src, cv2.COLOR_BGR2GRAY)
    # Threshold it so it becomes binary
    ret, thresh = cv2.threshold(src_grey, 0, 255,
                                cv2.THRESH_BINARY + cv2.THRESH_OTSU)
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

    black_transparent = np.array([0, 0, 0, 0])
    black_opaque = np.array([0, 0, 0, 255])

    data = []
    sprite_image_data = []
    max_sprite_height = 0
    for index, stat in enumerate(stats):
        x = stat[0]
        y = stat[1]
        width = stat[2]
        height = stat[3]
        max_sprite_height = max(max_sprite_height, height)
        label_data = {
            'x': np.asscalar(x),
            'y': np.asscalar(y),
            'width': np.asscalar(width),
            'height': np.asscalar(height),
            'angle': 0.0,
            'id': index,
        }
        label = src.copy()
        label = label[y:(y + height), x:(x + width)]
        label_masked = cv2.cvtColor(label, cv2.COLOR_BGR2BGRA)
        label_filled = cv2.cvtColor(label, cv2.COLOR_BGR2GRAY)
        label_mask = labels[y:(y + height), x:(x + width)]

        for y in range(height):
            for x in range(width):
                if label_mask[y, x] != index:
                    label_masked[y, x] = black_transparent
                    label_filled[y, x] = 0
                else:
                    label_masked[y, x] = black_opaque
                    label_filled[y, x] = 255

        ret, thresh = cv2.threshold(label_filled, 0, 255,
                                    cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        im2, contours, hierarchy = \
            cv2.findContours(thresh,
                             cv2.RETR_TREE,
                             cv2.CHAIN_APPROX_SIMPLE)
        if len(contours) > 0:
            # print("found {} contours".format(len(contours)))
            rect = cv2.minAreaRect(contours[0])
            box = cv2.boxPoints(rect)
            box = np.int0(box)
            # cv2.drawContours(label_masked, [box], 0, (0, 0, 255, 255), 2)
            label_data["angle"] = rect[2]
        # cv2.imwrite("{}.label_{}.png".format(city_name, index), label_masked)
        sprite_image_data.append({
            'image': label_masked,
            'data': label_data
        })
        data.append(label_data)

    def resizeSpriteImageToMaxHeight(sprite_image, max_height):
        height = sprite_image['data']['height']
        bottom_border = max_height - height
        return cv2.copyMakeBorder(sprite_image['image'],
                                  0, bottom_border, 0, 0,
                                  cv2.BORDER_WRAP)

    sprite_image = resizeSpriteImageToMaxHeight(sprite_image_data[0],
                                                max_sprite_height)
    sprite_offset = 0
    data[0]['sprite_offset'] = sprite_offset
    sprite_offset += sprite_image_data[0]['data']['width']
    for index in range(1, len(sprite_image_data)):
        next_image = resizeSpriteImageToMaxHeight(sprite_image_data[index],
                                                  max_sprite_height)
        sprite_image = np.concatenate((sprite_image, next_image), axis=1)
        data[index]['sprite_offset'] = sprite_offset
        sprite_offset += sprite_image_data[index]['data']['width']

    cv2.imwrite("{}.label_sprites.png".format(city_name), sprite_image)
    cv2.imwrite("{}.labels.png".format(city_name), labels)
    with open("{}.labels.json".format(city_name), 'w') as f:
        json.dump(data, f, indent=4, sort_keys=True)
