# Mocky

A chrome extension that mocks outgoing network requests based on resource types with a mock extracted from provided .har file.

## How are request matched and mocked

Url, request method, resource type and post data(if present) are used to compare with what in the har file. If a match is found the corresponding request from the har file is returned.


Extension currently published:
- [x] [Chrome](https://chrome.google.com/webstore/detail/mocky/hpmgblgihdlkcegplalpibfbpheknido)
- [ ] Firefox
- [ ] Opera (Chrome Build)
- [ ] Edge (Chrome Build)
- [ ] Brave
- [ ] Safari

Credit to [Debdut Karmakar](https://github.com/debdut) for [extension template](https://github.com/Debdut/browser-extension)
