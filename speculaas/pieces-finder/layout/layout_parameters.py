import rectpack
from rectpack import PackingBin

bin_algorithms = {
    "BNF": PackingBin.BNF,
    # "BFF": PackingBin.BFF,
    # "BBF": PackingBin.BBF,
    # "Global": PackingBin.Global
}
pack_algorithms = {
    'MaxRectsBssf': rectpack.MaxRectsBssf,
    'MaxRectsBaf': rectpack.MaxRectsBaf,
    'MaxRectsBlsf': rectpack.MaxRectsBlsf,
    'MaxRectsBl': rectpack.MaxRectsBl,
    'GuillotineBssfSas':   rectpack.GuillotineBssfSas,
    'GuillotineBssfLas':   rectpack.GuillotineBssfLas,
    'GuillotineBssfSlas':  rectpack.GuillotineBssfSlas,
    'GuillotineBssfLlas':  rectpack.GuillotineBssfLlas,
    'GuillotineBssfMaxas': rectpack.GuillotineBssfMaxas,
    'GuillotineBssfMinas': rectpack.GuillotineBssfMinas,
    'GuillotineBlsfSas':   rectpack.GuillotineBlsfSas,
    'GuillotineBlsfLas':   rectpack.GuillotineBlsfLas,
    'GuillotineBlsfSlas':  rectpack.GuillotineBlsfSlas,
    'GuillotineBlsfLlas':  rectpack.GuillotineBlsfLlas,
    'GuillotineBlsfMaxas': rectpack.GuillotineBlsfMaxas,
    'GuillotineBlsfMinas': rectpack.GuillotineBlsfMinas,
    'GuillotineBafSas':    rectpack.GuillotineBafSas,
    'GuillotineBafLas':    rectpack.GuillotineBafLas,
    'GuillotineBafSlas':   rectpack.GuillotineBafSlas,
    'GuillotineBafLlas':   rectpack.GuillotineBafLlas,
    'GuillotineBafMaxas':  rectpack.GuillotineBafMaxas,
    'GuillotineBafMinas':  rectpack.GuillotineBafMinas
}
sort_algorithms = {
    'SORT_AREA': rectpack.SORT_AREA,
    'SORT_PERI': rectpack.SORT_PERI,
    'SORT_DIFF': rectpack.SORT_DIFF,
    'SORT_SSIDE': rectpack.SORT_SSIDE,
    'SORT_LSIDE': rectpack.SORT_LSIDE,
    'SORT_RATIO': rectpack.SORT_RATIO,
    'SORT_NONE': rectpack.SORT_NONE
}


class LayoutParameters:

    def __init__(self,
                 bin_algorithm_name='BNF',
                 pack_algorithm_name='MaxRectsBssf',
                 sort_algorithm_name='SORT_AREA'):
        self.bin_algorithm_name = bin_algorithm_name
        self.pack_algorithm_name = pack_algorithm_name
        self.sort_algorithm_name = sort_algorithm_name

    @staticmethod
    def list_all():
        for bin_algorithm in sorted(bin_algorithms.keys()):
            for pack_algorithm in sorted(pack_algorithms.keys()):
                for sort_algorithm in sorted(sort_algorithms.keys()):
                    yield LayoutParameters(bin_algorithm,
                                           pack_algorithm,
                                           sort_algorithm)

    def bin_algorithm(self):
        return bin_algorithms[self.bin_algorithm_name]

    def pack_algorithm(self):
        return pack_algorithms[self.pack_algorithm_name]

    def sort_algorithm(self):
        return sort_algorithms[self.sort_algorithm_name]

    def to_json(self):
        return {
            'bin': self.bin_algorithm_name,
            'pack': self.pack_algorithm_name,
            'sort': self.sort_algorithm_name
        }

    @classmethod
    def from_json(cls, json_ser):
        return LayoutParameters(bin_algorithm_name=json_ser['bin'],
                                pack_algorithm_name=json_ser['pack'],
                                sort_algorithm_name=json_ser['sort'])

    def short_name(self):
        return "{0}/{1}/{2}".format(self.bin_algorithm_name,
                                    self.pack_algorithm_name,
                                    self.sort_algorithm_name)

    def filename_safe_short_name(self):
        return "{0}_{1}_{2}".format(self.bin_algorithm_name,
                                    self.pack_algorithm_name,
                                    self.sort_algorithm_name)
