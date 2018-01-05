import logging


class SplitterCache:
    def __init__(self, splitter):
        self.splitter = splitter
        self.cache = {}
        self.pre_cached = False

    def pre_cache_all_place_ids(self):
        if not self.pre_cached:
            logging.info("pre-caching starting")
            for place_id in self.splitter.place_ids:
                logging.info("pre-caching {}".format(place_id))
                self.split(place_id)
            self.pre_cached = True
            logging.info("pre-caching completed")

    def split(self, place_id):
        if place_id in self.cache:
            logging.info("cache hit for {}".format(place_id))
            return self.cache[place_id]
        else:
            logging.info("cache miss for {}".format(place_id))
            place = self.splitter.split(place_id)
            self.cache[place_id] = place
            return place
