# Mocky

Mocky is a browser extension that resolves outgoing client-initiated network requests with pre-determined responses recorded in `.har` file. Below is a quick demo:

![](https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExZDViN2QxNzViNjYxMTM5OWExYjc4OTczOTE3NjRiMjBjYmFmODEzMSZlcD12MV9pbnRlcm5hbF9naWZzX2dpZklkJmN0PWc/9zaqsxtpWXnWqOQ0x5/giphy.gif)

## How are the requests resolved?
> Primer: A HAR file contains a record of all data exchanged between client and server. The data is recorded in `<request, response>` pairs and segmented by pages 

An intiated request is matched to request present in the `.har` file based on following values:
- Request URL
- Request method (GET/POST/...)
- Request Post data (if present)
- Resource type of the response data (XHR/Fetch/Document)

Once a matching request is found in the provided file, the network request is resolved with response which is part of the same `<request, response>` pair as the request

## Current features
- Select the resource types to base request matching on
- Ignore hostname of the request (only match request on the path which proceeds the hostname)


## Extension currently published:
- [x] [Chrome](https://chrome.google.com/webstore/detail/mocky/hpmgblgihdlkcegplalpibfbpheknido)
- [ ] Firefox
- [ ] Opera (Chrome Build)
- [ ] Edge (Chrome Build)
- [ ] Brave
- [ ] Safari

Credit to [Debdut Karmakar](https://github.com/debdut) for [extension template](https://github.com/Debdut/browser-extension)
