# Run-through of most basic set up process

```bash
$ func init azure-functions-test
$ cd azure-functions-test/
# bootstrap a function
$ func new
# start local test environment
$ func start

# get list of locations (we'll be using francecentral)
$ az account list-locations

# create a resource group that will be host to all project resources
$ az group create --name dearchiver-rg --location francecentral

# create storage account where function data will be stored (deployment packages, etc.)
$ az storage account create --name dearchiverfuncstorage --location francecentral --resource-group dearchiver-rg --sku Standard_LRS --allow-blob-public-access false

# create remote function app
$ az functionapp create --resource-group dearchiver-rg --consumption-plan-location francecentral --runtime node --runtime-version 18 --functions-version 4 --name dearchiver-func --storage-account dearchiverfuncstorage

$ az functionapp config appsettings set --name dearchiver-func --resource-group dearchiver-rg --settings AzureWebJobsFeatureFlags=EnableWorkerIndexing

# publish local function to remote function app
$ func azure functionapp publish dearchiver-func

# open log stream of remote function app for local inspection
$ func azure functionapp logstream dearchiver-func

# set remote env vars
$ az functionapp config appsettings set --name dearchiver-func --resource-group dearchiver-rg --settings CONTAINER_NAME=archives-pod ACCOUNT_NAME=jfixsearchstorage ACCOUNT_KEY="xxxx"
```