#!/bin/bash -e

# 変数を定義する
region='japaneast'    # デプロイ先のリージョン
resourceGroupName=$1  # デプロイ先のリソースグループ (スクリプトの引数から取得する)

# Cognitive Search に関する名前を定義する
cognitiveSearchIndexName="sample-image-search"

# リソースグループを作成する
az group create \
    --location $region \
    --resource-group $resourceGroupName

# Azure リソースをデプロイする
outputs=($(az deployment group create \
            --resource-group $resourceGroupName \
            --template-file cognitive_search.bicep \
            --query 'properties.outputs.*.value' \
            --output tsv))
cognitiveSearchName=`echo ${outputs[0]}` # 文末の \r を削除する

# Cognitive Search の API キーを取得する
cognitiveSearchApiKey=`az search admin-key show --service-name $cognitiveSearchName --resource-group $resourceGroupName --query 'primaryKey' --output tsv`

# 使用する Cognitive Search REST API のバージョンを指定する
cognitiveSearchApiVersion='2023-07-01-Preview'

# Cognitive Search インデックスを作成する
curl -X PUT https://$cognitiveSearchName.search.windows.net/indexes/$cognitiveSearchIndexName?api-version=$cognitiveSearchApiVersion \
    -H 'Content-Type: application/json' \
    -H 'api-key: '$cognitiveSearchApiKey \
    -d @cognitive_search_index.json

# Cognitive Search へアクセスするためのクエリキーを取得する
cognitiveSearchQueryKey=`az search query-key list --resource-group $resourceGroupName --service-name $cognitiveSearchName --query "[0].key" --output tsv`

# ローカルで動かす Python アプリのために cognitive_search_account.json と static/settings.js を生成する
echo "
{
  \"name\": \"$cognitiveSearchName\",
  \"adminKey\": \"$cognitiveSearchApiKey\",
  \"queryKey\": \"$cognitiveSearchQueryKey\",
  \"indexName\": \"$cognitiveSearchIndexName\"
}" > cognitive_search_account.json

sed -e "s/{{NAME}}/$cognitiveSearchName/g" \
    -e "s/{{KEY}}/$cognitiveSearchQueryKey/g" \
    -e "s/{{INDEX_NAME}}/$cognitiveSearchIndexName/g" \
    "static/settings_template.js" > static/settings.js