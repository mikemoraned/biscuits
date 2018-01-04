from PIL import Image

transparent_image = Image.new('RGBA', (1, 1))
pixel_data = transparent_image.load()
pixel_data[0, 0] = (0, 0, 0, 0)

transparent_image_data_url = "data:image/png;base64," \
                             "iVBORw0KGgoAAAANSUhEUg" \
                             "AAAAEAAAABCAYAAAAfFcSJ" \
                             "AAAADUlEQVR4nGNgYGBgAA" \
                             "AABQABpfZFQAAAAABJRU5E" \
                             "rkJggg=="
