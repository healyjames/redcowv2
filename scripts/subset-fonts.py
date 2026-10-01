import sys
import tempfile
from pathlib import Path
from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

UNICODES = "U+0020-007E,U+00A0-00FF,U+0131,U+0152-0153,U+2013-2014,U+2018-201E,U+2022,U+2026,U+2190-2193,U+20AC,U+2122"
LAYOUT_FEATURES = "kern,liga,ccmp,locl,mark,mkmk,calt,clig"


def limit_weight(source, directory, weight_range):
    font = TTFont(source)
    weight_axis = next(axis for axis in font["fvar"].axes if axis.axisTag == "wght")
    if weight_range == (weight_axis.minValue, weight_axis.maxValue):
        return source
    limited = directory / "limited.ttf"
    instancer.instantiateVariableFont(font, {"wght": weight_range}).save(limited)
    return limited


def build_woff2(source, destination, weight_range):
    with tempfile.TemporaryDirectory() as directory:
        limited = limit_weight(source, Path(directory), weight_range)
        subset.main([
            str(limited),
            f"--unicodes={UNICODES}",
            f"--layout-features={LAYOUT_FEATURES}",
            "--flavor=woff2",
            f"--output-file={destination}",
        ])


if __name__ == "__main__":
    source, destination, low, high = sys.argv[1:5]
    build_woff2(Path(source), Path(destination), (float(low), float(high)))
    print(f"{destination}: {Path(destination).stat().st_size} bytes")
