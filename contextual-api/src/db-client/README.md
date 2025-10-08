# db-client

This uses @dennoa/chunkly to create document chunks for any collection so all collections are defined with properties that correspond to the output of chunkly.

When uploading files, the request body must contain a file property with the binary file data, but can optionally also contain:
1. `dryRun=true` if you want to test it out without saving the document chunks
1. `sections=[{ from, to, ref }]` if you want to specify sections for chunkly. This is a stringified array where all properties are optional string values

The recommended approach is to set dryRun=true until you are happy with the chunks being returned. Use the chunk text to identify the from / to words

See `test/file-upload.html` for a simple example.

## collections

Considerations for chunking include the chunk size parameters as well as deciding how to group documents into collections.

## example usage

### create a collection

Note that the collection name must be an alphanumeric string and will be uppercased by the server.

```js
fetch('http://localhost:3000/collections', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'nccd' })
}).then(res => res.json()).then(json => console.log(json))
```

## list collections

```js
fetch('http://localhost:3000/collections', {
  method: 'GET',
  headers: { 'Content-Type': 'application/json' }
}).then(res => res.json()).then(json => console.log(json))
```

## upload a file

Refer to `test/file-upload.html` for an example.

```js
fetch('http://localhost:3000/collections/nccd/upload', {
  method: 'POST',
  body: formData,
}).then(res => res.json()).then(json => console.log(json))
```

## list chunks in a collection

Can optionally specify offset and limit.

```js
fetch('http://localhost:3000/collections/nccd/chunks?offset=0&limit=100', {
  method: 'GET',
  headers: { 'Content-Type': 'application/json' }
}).then(res => res.json()).then(json => console.log(json))
```

## list chunks near some test

Can optionally specify offset and limit.

```js
fetch(`http://localhost:3000/collections/nccd/neartext?text=${encodeURIComponent('how is NCCD data used')}`, {
  method: 'GET',
  headers: { 'Content-Type': 'application/json' }
}).then(res => res.json()).then(json => console.log(json))
```

## delete a collection

```js
fetch('http://localhost:3000/collections/nccd', {
  method: 'DELETE',
  headers: { 'Content-Type': 'application/json' }
}).then(res => res.json()).then(json => console.log(json))
```
