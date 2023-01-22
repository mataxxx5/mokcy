export default (evt: ProgressEvent<FileReader>) => {
  if (typeof evt?.target?.result === 'string') {
    return JSON.parse(evt.target.result)
  }

  return null
}
