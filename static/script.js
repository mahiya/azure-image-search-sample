new Vue({
    el: '#app',
    data: {
        imageFileNames: [],
        selectedImageFileName: null,
        searching: false,
        searchResults: []
    },
    async mounted() {
        this.settings = settings;
        this.imageFileNames = await this.getImageFileNames();
        if (this.imageFileNames.length > 0)
            this.selectImage(this.imageFileNames[0]);
    },
    methods: {
        getImageFileNames: async function () {
            const resp = await axios.get('/images');
            return resp.data.imageFileNames;
        },
        selectImage: async function (imageFileName) {
            this.selectedImageFileName = imageFileName;
            this.searchResults = [];
            this.searchResults = await this.searchSimilarImages(this.selectedImageFileName);
        },
        searchSimilarImages: async function (imageFileName) {
            this.searching = true;
            const url = `https://${this.settings.name}.search.windows.net/indexes/${this.settings.indexName}/docs/search?api-version=${this.settings.apiVersion}`;
            const headers = { "Content-Type": "application/json", "api-key": this.settings.key };
            const body = {
                "top": this.settings.searchTop,
                "select": this.settings.select,
                "vector": {
                    "value": await this.getImageVector(imageFileName),
                    "fields": "contentVector",
                }
            };
            const resp = await axios.post(url, body, { headers });
            this.searching = false;
            return resp.data.value
                .map(v => { return { "name": v.fileName, "score": v["@search.score"] }; })
                .filter(v => v.name != this.selectedImageFileName);
        },
        getImageVector: async function (imageFileName) {
            const resp = await axios.get(`/vector?name=${(imageFileName)}`);
            return resp.data.vector;
        },
    }
});