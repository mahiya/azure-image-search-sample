new Vue({
    el: '#app',
    data: {
        imageFileNames: [], // 選択可能な画像ファイル名の一覧
        selectedImageFileName: null, // 選択された画像の名前
        searching: false, // 検索中であるかどうか
        searchResults: [] // 検索結果 { "name": "画像の名前", "score": "検索スコア" }
    },
    // 画面表示時の処理
    async mounted() {
        this.settings = settings; // Azure Cognitive Search の情報を settings.jsから 取得する
        this.imageFileNames = await this.getImageFileNames(); // 選択可能な画像ファイル名一覧を取得する
        if (this.imageFileNames.length > 0)
            this.selectImage(this.imageFileNames[0]); // 一番上の画像を選択された状態とする
    },
    methods: {
        // 選択可能な画像ファイル名一覧を取得する
        getImageFileNames: async function () {
            const resp = await axios.get('/images');
            return resp.data.imageFileNames;
        },
        // 画像ファイル名が選択された時の処理
        selectImage: async function (imageFileName) {
            this.selectedImageFileName = imageFileName;
            this.searchResults = [];
            this.searchResults = await this.searchSimilarImages(this.selectedImageFileName);
        },
        // Azure Cognitive Search で類似の画像を検索する
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
        // 指定した画像ファイル名の画像のベクトル情報を取得する
        getImageVector: async function (imageFileName) {
            const resp = await axios.get(`/vector?name=${(imageFileName)}`);
            return resp.data.vector;
        },
    }
});