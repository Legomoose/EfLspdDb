# Oulsen Satellite Map Preview

This build converts the six `minimap_sea` DDS textures for both grid and no-grid into browser-ready WebP mosaics. Source: https://github.com/Oulsen/oulsen_satmap (see source LICENSE).

Postal lookup uses the included postal JSON. **IMPORTANT:** GTA-world-coordinate to map-image alignment is a rough initial approximation, NOT yet calibrated or verified. Postal placements should not be used for official records until tested against known GTA locations and calibrated. Existing browser-local case data is preserved under the original localStorage key but is not loaded into this preview because its old map coordinates are incompatible.

No shared database or authentication is included. Test in a separate GitHub Pages repository or development branch/preview before replacing the live site.


## Postal calibration update
World-to-map conversion fitted to postal 729, 735 and 761 visible in user screenshot, registered to Oulsen HD image via feature matching. This is a first calibrated fit, not yet field-verified at all postals.

## Postal alignment v2
Updated world-to-map transform from directly inspected pixel locations of printed postals 729, 735, and 761 in the Oulsen HD map. This should significantly improve lookup accuracy but has not been verified across all postals. Search zoom set to 1.
