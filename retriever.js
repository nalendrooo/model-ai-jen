import fs from 'fs'
import pdf from 'pdf-parse'

// Membaca file PDF
let dataBuffer = fs.readFileSync(`/books/ipa.pdf`)

pdf(dataBuffer).then(function (data) {
    // Output teks yang diekstrak
    console.log(data.text);
})