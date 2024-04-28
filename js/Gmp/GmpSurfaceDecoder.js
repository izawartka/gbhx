export default class GmpSurfaceParser {
    static parseSideSurface(data) {
        // data is a Uint16Array
        /*
        bits 0-9	tile graphic number (0-1023)
        bit 10	wall (1 = collide, 0 = no collide)
        bit 11	bullet wall (1 = collide, 0 = no collide)
        bit 12	flat (1 = flat, 0 = not flat)
        bit 13	flip (1 = flip, 0 = no flip )
        bit 14-15	rotation code (0=0, 1=90, 2=180, 3=270)
        */

        const tileID = data & 0x3FF;
        if(tileID == 0) return null; // Empty surface (no tile)

        return {
            tileID: tileID,
            wall: !!(data & 0x400),
            bulletWall: !!(data & 0x800),
            flat: !!(data & 0x1000),
            flip: !!(data & 0x2000),
            rotation: (data & 0xC000) >> 14
        }
    }

    static parseLidSurface(data) {
        // data is a Uint16Array
        /*
        bits 0-9	tile graphic number (0-1023)
        bit 10-11	lighting level (0-3)
        bit 12	flat (1 = flat, 0 = not flat)
        bit 13	flip (1 = flip, 0 = no flip )
        bit 14-15	rotation code (0=0, 1=90, 2=180, 3=270)
        */

        const tileID = data & 0x3FF;
        if(tileID == 0) return null; // Empty surface (no tile)

        return {
            tileID: tileID,
            lighting: (data & 0xC00) >> 10,
            flat: !!(data & 0x1000),
            flip: !!(data & 0x2000),
            rotation: (data & 0xC000) >> 14
        }
    }
}