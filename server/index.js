const express = require('express');
const fs = require('fs-extra');
const { promisify } = require('util');
const { exec } = require('child_process');

const app = express();
const writeFileAsync = promisify(fs.writeFile);

app.use(express.json());

app.post('/api/compile', async (req, res) => {
  try {
    const { latexText } = req.body;
    const texFilePath = 'input.tex';
    const outputFilePath = 'output.pdf';

    // Zapisz kod LaTeX do pliku input.tex
    await writeFileAsync(texFilePath, latexText);

    // Wywołaj pdflatex do skompilowania pliku input.tex na output.pdf
    exec(`pdflatex -interaction=nonstopmode -output-directory=./ ${texFilePath}`, async (error) => {
      if (error) {
        console.error('Error generating PDF:', error);
        res.status(500).json({ error: 'Error generating PDF' });
      } else {
        // Usuń zbędne pliki tymczasowe wygenerowane przez pdflatex
        await fs.remove(texFilePath);
        await fs.remove('input.aux');
        await fs.remove('input.log');

        const fileURL = `${req.protocol}://${req.get('host')}/api/download`;
        res.json({ fileURL });
      }
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ error: 'Error generating PDF' });
  }
});

app.get('/api/download', (req, res) => {
  const file = 'output.pdf';
  res.download(file);
});

app.listen(5000, () => {
  console.log('Server started on port 5000');
});
