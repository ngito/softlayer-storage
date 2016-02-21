
# Request - SoftLayer ObjectStorage

How to setup SoftLayer connection information:

Export SoftLayer Information to environment variables as JSON format
Windows:
    set SOFTLAYER_STORAGE=...
Linux/UNIX:
    export SOFTLAYER_STORAGE=...

JSON Sample Format:
{
  "authEndpoint" : "https://dal05.objectstorage.softlayer.net/auth/v1.0/",
  "apiKey"       : "softlayer_apikey",
  "user"         : "softlayer_user",
  "container"    : "softlayer_container"
}

Notes:
You may want to make JSON SoftLayer Information as one line, to make it easy to set in .bashrc or in Windows Environment Variable 
