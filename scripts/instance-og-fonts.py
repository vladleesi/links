"""One-time asset maintenance, never required by builds.

Run with FontTools 4.66.1: python3 scripts/instance-og-fonts.py
Instantiate the vendored, licensed fonts for resvg 2.6 (no variable-weight support).
"""
from pathlib import Path
import hashlib
import json
import fontTools
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

if fontTools.__version__ != "4.66.1":
    raise RuntimeError("Use FontTools 4.66.1 to reproduce the checked-in assets.")

root = Path(__file__).resolve().parents[1]
weights = {
    "opensans": [400, 700], "manrope": [400, 700], "ibm-plex-sans": [400, 700],
    "jetbrains-mono": [400, 700], "lora": [400, 700], "space-grotesk": [400, 700],
    "archivo": [400, 700], "source-sans-3": [400],
}
families = {
    "opensans": "OG Sans", "manrope": "OG Manrope", "ibm-plex-sans": "OG IBM Sans",
    "jetbrains-mono": "OG JetBrains Mono", "lora": "OG Serif", "space-grotesk": "OG Space Grotesk",
    "archivo": "OG Archivo", "source-sans-3": "OG Humanist",
}
licenses = {
    "opensans": "OFL-OpenSans.txt", "manrope": "OFL.txt", "ibm-plex-sans": "OFL-IBMPlexSans.txt",
    "jetbrains-mono": "OFL-JetBrainsMono.txt", "lora": "OFL-Lora.txt", "space-grotesk": "OFL-SpaceGrotesk.txt",
    "archivo": "OFL-Archivo.txt", "source-sans-3": "OFL-SourceSans3.txt",
}
records = []
for name, values in weights.items():
    for weight in values:
        source = root / f"public/fonts/{name}.ttf"
        font = TTFont(source, recalcTimestamp=False)
        axes = {axis.axisTag: weight if axis.axisTag == "wght" else axis.defaultValue
                for axis in font["fvar"].axes}
        instance = instantiateVariableFont(font, axes, inplace=True, updateFontNames=True)
        # Renaming respects OFL Reserved Font Names on modified font files.
        family = families[name]
        style = "Bold" if weight == 700 else "Regular"
        names = {1: family, 2: style, 3: f"{family}-{style}", 4: f"{family} {style}",
                 6: f"{family.replace(' ', '')}-{style}", 16: family, 17: style}
        for record in instance["name"].names:
            if record.nameID in names:
                record.string = names[record.nameID].encode(record.getEncoding())
        output = root / f"src/assets/fonts/og/{name}-{weight}.ttf"
        instance.save(output)
        records.append({"file": output.name, "family": family, "weight": weight,
                        "source": str(source.relative_to(root)), "sourceSha256": hashlib.sha256(source.read_bytes()).hexdigest(),
                        "sha256": hashlib.sha256(output.read_bytes()).hexdigest(), "license": f"public/fonts/{licenses[name]}"})
(root / "src/assets/fonts/og/sources.json").write_text(json.dumps({
    "generator": "scripts/instance-og-fonts.py", "tool": "FontTools 4.66.1",
    "notes": "Static weight instances of existing vendored fonts, with renamed families to respect OFL reserved names. No font downloads or build dependencies.",
    "fonts": records,
}, indent=2) + "\n")
