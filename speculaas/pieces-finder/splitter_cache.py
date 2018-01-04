class SplitterCache:

    def __init__(self, splitter):
        self.splitter = splitter
        self.cache = {}

    @classmethod
    def from_precomputed(cls, precomputed_splitter, pre_cache):
        splitter_cache = SplitterCache(precomputed_splitter)
        if pre_cache:
            for place_id in precomputed_splitter.place_ids:
                splitter_cache.split(place_id)
        return splitter_cache

    def split(self, place_id):
        if place_id in self.cache:
            print("Using cache for {}".format(place_id))
            return self.cache[place_id]
        else:
            place = self.splitter.split(place_id)
            self.cache[place_id] = place
            return place
