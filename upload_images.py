import os
import json
import base64
from glob import glob
from image2vec import image2vec
from azure.core.credentials import AzureKeyCredential
from azure.search.documents import SearchClient

# static/images フォルダ配下にある全ての画像のベクトル情報を取得して
# Azure Cognitive Search のインデックスに登録するドキュメントを用意する
image_paths = glob('static/images/*.jpg')
documents = []
for image_path in image_paths:
    file_name = os.path.basename(image_path)
    vec = image2vec(image_path)
    documents.append({
        # ドキュメントの ID を画像ファイル名を Base64 エンコードしたものとする
        'id': base64.b64encode(file_name.encode()).decode(),
        'fileName': file_name,
        'contentVector': vec
    })

# Azure Cognitive Search のアカウント情報を取得する
with open("cognitive_search_account.json", "r") as f:
    cogsearch_account = json.load(f)
    service_name = cogsearch_account['name']
    admin_key = cogsearch_account['adminKey']
    index_name = cogsearch_account['indexName']

# Azure Cognitive Search のインデックスにドキュメントを登録する
search_client = SearchClient(
    endpoint=f"https://{service_name}.search.windows.net/",
    index_name=index_name,
    credential=AzureKeyCredential(admin_key))
search_client.upload_documents(documents=documents)