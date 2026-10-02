# Zeeman Culture

Static presentation website for Zeeman Culture, a cross-cultural creative
marketing agency operating across London and Shanghai.

## Local preview

Run a static server from the repository root:

```sh
python3 -m http.server 8091
```

Then open `http://127.0.0.1:8091/`.

## Checks

```sh
python3 -m unittest discover -s tests
node --check assets/js/site.js
node --check assets/js/home-vine.js
node --check assets/js/home-journal.js
```

The Journal is a static design preview with three sample editorials; every
Journal page is excluded from indexing. Refresh the local browser after edits.
