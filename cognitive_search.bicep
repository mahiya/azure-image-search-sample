//////////////////////////////////////////////////////////////////////
//// Parameters
//////////////////////////////////////////////////////////////////////

// Parameters for New Resources
param location string = resourceGroup().location
param name string = 'cogs-${uniqueString(resourceGroup().id)}'
param sku string = 'standard'

//////////////////////////////////////////////////////////////////////
//// Definitions of New Resources
//////////////////////////////////////////////////////////////////////

// Cognitive Search Service
resource cognitiveSearch 'Microsoft.Search/searchServices@2020-08-01' = {
  name: name
  location: location
  sku: {
    name: sku
  }
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    hostingMode: 'default'
    publicNetworkAccess: 'enabled'
    partitionCount: 1
    replicaCount: 1
  }
}

//////////////////////////////////////////////////////////////////////
//// Outputs
//////////////////////////////////////////////////////////////////////
output name string = cognitiveSearch.name
output principalId string = cognitiveSearch.identity.principalId
