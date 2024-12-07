import { Firestore } from '@google-cloud/firestore';
import dotenv from 'dotenv';


// Load .env file
dotenv.config();

// Validasi apakah SERVICE_ACCOUNT_KEY tersedia
if (!process.env.SERVICE_ACCOUNT_KEY) {
  throw new Error('SERVICE_ACCOUNT_KEY tidak ditemukan di .env file. Pastikan file .env telah dibuat dan berisi kredensial yang benar.');
}

// Parse SERVICE_ACCOUNT_KEY dari .env dan pastikan formatnya benar
let serviceAccountKey;
try {
  serviceAccountKey = JSON.parse(process.env.SERVICE_ACCOUNT_KEY);
} catch (error) {
  throw new Error('SERVICE_ACCOUNT_KEY tidak dapat diparsing. Pastikan JSON valid.');
}

// Format private key untuk menangani masalah dengan newline
const formattedPrivateKey = serviceAccountKey.private_key.replace(/\\n/g, '\n');

// Inisialisasi Firestore dengan Service Account Key
const db = new Firestore({
  projectId: serviceAccountKey.project_id,
  credentials: {
    client_email: serviceAccountKey.client_email,
    private_key: formattedPrivateKey,
  },
});

// Referensi ke koleksi Firestore
const predictionsCollection = db.collection('predictions');

/**
 * Fungsi untuk menyimpan data ke Firestore
 * @param {string} id - ID dokumen di Firestore
 * @param {Object} data - Data yang akan disimpan
 * @returns {Promise<{success: boolean, error?: string}>}
 */
async function storeData(id, data) {
  try {
    const docRef = predictionsCollection.doc(id);
    await docRef.set(data);
    console.log(`[Firestore] Data berhasil disimpan dengan ID "${id}":`, data);
    return { success: true };
  } catch (error) {
    console.error(`[Firestore] Error saat menyimpan data: ${error.message}`);
    return { success: false, error: error.message || 'Gagal menyimpan data' };
  }
}

/**
 * Fungsi untuk membaca data dari Firestore
 * @param {string} id - ID dokumen yang akan diambil
 * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
 */
async function getData(id) {
  try {
    const docRef = predictionsCollection.doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      console.warn(`[Firestore] Dokumen dengan ID "${id}" tidak ditemukan.`);
      return { success: false, error: 'Dokumen tidak ditemukan' };
    }

    console.log(`[Firestore] Data dengan ID "${id}" berhasil diambil:`, doc.data());
    return { success: true, data: doc.data() };
  } catch (error) {
    console.error(`[Firestore] Error saat membaca data: ${error.message}`);
    return { success: false, error: error.message || 'Gagal membaca data' };
  }
}

/**
 * Fungsi untuk menghapus data dari Firestore
 * @param {string} id - ID dokumen yang akan dihapus
 * @returns {Promise<{success: boolean, error?: string}>}
 */
async function deleteData(id) {
  try {
    const docRef = predictionsCollection.doc(id);
    await docRef.delete();
    console.log(`[Firestore] Data dengan ID "${id}" berhasil dihapus.`);
    return { success: true };
  } catch (error) {
    console.error(`[Firestore] Error saat menghapus data: ${error.message}`);
    return { success: false, error: error.message || 'Gagal menghapus data' };
  }
}

// Ekspor fungsi dan referensi koleksi
export { predictionsCollection, storeData, getData, deleteData };







/*
// Load .env file
dotenv.config();

// Parse Service Account Key dari .env
const serviceAccountKey = JSON.parse(process.env.SERVICE_ACCOUNT_KEY);

// Inisialisasi Firestore dengan Service Account Key
const db = new Firestore({
  projectId: serviceAccountKey.project_id,
  credentials: {
    client_email: serviceAccountKey.client_email,
    private_key: serviceAccountKey.private_key,
  },
});

// Referensi ke koleksi "predictions"
const predictionsCollection = db.collection('predictions');

// Fungsi untuk menyimpan data ke Firestore
async function storeData(id, data) {
  try {
    const docRef = predictionsCollection.doc(id);
    await docRef.set(data);
    console.log('Data berhasil disimpan.');
    return { success: true };
  } catch (error) {
    console.error('Error in storeData:', error);
    return { success: false, error: 'Failed to store data' };
  }
}

// Ekspor modul
export { predictionsCollection, storeData };

/*
const db = new Firestore();
const predictionsCollection = db.collection('predictions');

async function storeData(id, data) {
  try {
    const predictCollection = db.collection('predictions');
    await predictCollection.doc(id).set(data);
    return { success: true };
  } catch (error) {
    console.error('Error in storeData:', error);
    return { success: false, error: 'Failed to store data' };
  }
}

export { predictionsCollection, storeData };

*/
