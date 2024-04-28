export default class PagedContentParser {

    static parse(data, pageWidth, pageHeight, segmentWidth, segmentHeight) {

        const pageSize = pageWidth*pageHeight;
        const pagesCount = ~~(data.byteLength/pageSize);
        const segmentSize = segmentWidth*segmentHeight;
        const segmentsPerPage = ~~(pageSize/segmentSize);
        const segmentsWidthCount = ~~(pageWidth/segmentWidth);

        if(data.byteLength%pageSize != 0) {
            throw new Error("PagedContentParser: invalid data size");
        }

        if(pageWidth%segmentWidth != 0 || pageHeight%segmentHeight != 0) {
            throw new Error("PagedContentParser: invalid segment size");
        }

        const segments = [];

        for(let i = 0; i < pagesCount; i++) {
            let pageData = new Uint8Array(data, i*pageSize, pageSize);

            for(let j = 0; j < pageSize/segmentWidth; j++) {
                let segX = j%segmentsWidthCount;
                let segY = ~~(j/(segmentsWidthCount*segmentHeight));
                let segID = segY*segmentsWidthCount + segX;
                let segAbsID = i*segmentsPerPage + segID;

                if(!segments[segAbsID]) segments[segAbsID] = {
                    data: [],
                    pageID: i,
                    relID: segID,
                };
                
                const newData = pageData.slice(j*segmentWidth, j*segmentWidth+segmentWidth);
                segments[segAbsID].data.push(...newData);
            }
        }

        return segments;
    }
}