import express from 'express';
import cors from 'cors';
import pdfRoutes from './routes/pdf.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('/api/pdf', pdfRoutes);

app.listen(PORT, () => {
  console.log(`PDF Server running on port ${PORT}`);
});
