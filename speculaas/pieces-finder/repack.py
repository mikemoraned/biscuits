import sys
from rectpack import newPacker

from precomputed_lookup_splitter import PreComputedLookupSplitter

precomputed_dir = sys.argv[1]
place_id = sys.argv[2]
splitter = PreComputedLookupSplitter.from_dir(precomputed_dir)
print("Loaded {} ids from {}".format(len(splitter.place_ids),
                                     precomputed_dir))

place = splitter.split(place_id)
packer = newPacker()
for piece in place.pieces:
    packer.add_rect(width=piece.bitmap_image.width,
                    height=piece.bitmap_image.height,
                    rid=piece.id)

packer.add_bin(width=10000, height=10000)

packer.pack()

for rect in packer.rect_list():
    print(rect)
