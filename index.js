import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// 1. Inisialisasi Gemini AI menggunakan API Key dari file .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * 2. Konfigurasi Model & Instruksi Sistem
 * Model: Gemini 2.5 Flash
 * System Instruction: Menetapkan identitas SI AREMA-Bot
 */
const GEMINI_MODEL = "gemini-2.5-flash-preview-09-2025";

const systemInstruction = `
Anda adalah "SI AREMA-Bot", asisten AI resmi untuk Pengawas SMA Cabang Dinas Pendidikan Wilayah Kabupaten Malang. 
Identitas Anda adalah pendamping satuan pendidikan yang profesional, solutif, dan mengayomi.

Tugas utama Anda adalah membantu Kepala Sekolah dan Guru dalam:
1. Analisis Rapor Pendidikan: Mengidentifikasi akar masalah dan memberikan rekomendasi perbaikan.
2. Pendampingan Akreditasi: Memberikan panduan instrumen di DMS atau Sispena.
3. Administrasi & Regulasi: Menjelaskan aturan terkait ARKAS, e-Master, Dapodik, dan Juknis Kemendikbudristek.
4. Implementasi Kurikulum Merdeka: Memberikan ide inovasi pembelajaran (seperti metode Deep Learning) dan penyusunan modul ajar.

Gunakan bahasa Indonesia yang formal namun hangat. Selalu usahakan merujuk pada regulasi Kemendikbudristek yang berlaku.
`;

/**
 * 3. Endpoint API Chat
 */
app.post('/api/chat', async (req, res) => {
    try {
        const { conversation } = req.body;

        if (!conversation || !Array.isArray(conversation)) {
            return res.status(400).json({ error: "Format data tidak valid. 'conversation' harus berupa array." });
        }

        const model = genAI.getGenerativeModel({ 
            model: GEMINI_MODEL,
            systemInstruction: systemInstruction 
        });

        const generationConfig = {
            temperature: 0.5,
            topP: 0.95,
            topK: 45,
            maxOutputTokens: 2048,
        };

        const contents = conversation.map(msg => ({
            role: msg.role === 'model' ? 'model' : 'user',
            parts: [{ text: msg.text }],
        }));

        const result = await model.generateContent({
            contents,
            generationConfig,
        });

        const responseText = result.response.text();

        res.status(200).json({ 
            result: responseText 
        });

    } catch (error) {
        console.error("Kesalahan pada Server:", error);
        res.status(500).json({ 
            error: "Gagal memproses permintaan AI. Pastikan API Key di file .env sudah benar." 
        });
    }
});

/**
 * 4. Menjalankan Server Express
 */
app.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(`🚀 SI AREMA-Bot (Gemini 2.5 Flash) Aktif!`);
    console.log(`📡 Server berjalan di: http://localhost:${PORT}`);
    console.log(`📂 Lokasi Proyek: H:\\Maju AI\\gemini-chatbot-api`);
    console.log(`==================================================`);
});