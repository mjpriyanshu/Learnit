import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../lib/api';
import toast from 'react-hot-toast';
import {
    Award, Upload, Share2, Download, ExternalLink,
    Plus, CheckCircle, Shield, Globe, FileText
} from 'lucide-react';

const CertificatePage = () => {
    const [loading, setLoading] = useState(true);
    const [certificates, setCertificates] = useState([]);
    const [selectedCert, setSelectedCert] = useState(null);
    const [showUploadModal, setShowUploadModal] = useState(false);

    // Upload Form State
    const [uploadData, setUploadData] = useState({
        title: '',
        issuer: '',
        date: '',
        credentialUrl: '',
        description: ''
    });

    useEffect(() => {
        fetchCertificates();
    }, []);

    const fetchCertificates = async () => {
        try {
            const response = await api.get('/certificate/my-certificates');
            if (response.data.success) {
                // Mock some external certs if backend doesn't support them yet for demo
                const backendCerts = response.data.data;
                setCertificates(backendCerts);
                if (backendCerts.length > 0) setSelectedCert(backendCerts[0]);
            }
        } catch (error) {
            toast.error('Failed to load certificates');
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        try {
            // In a real app, this would post to backend. 
            // For now, we'll mock adding it to the local state to demonstrate the UI.
            // await api.post('/certificate/upload', uploadData);

            const newCert = {
                _id: 'ext_' + Date.now(),
                title: uploadData.title,
                recipientName: 'User', // dynamic in real app
                description: uploadData.description || `Issued by ${uploadData.issuer}`,
                completionDate: uploadData.date,
                isExternal: true,
                issuer: uploadData.issuer,
                credentialUrl: uploadData.credentialUrl,
                certificateId: 'EXT-' + Math.floor(Math.random() * 10000)
            };

            setCertificates([newCert, ...certificates]);
            setSelectedCert(newCert);
            setShowUploadModal(false);
            setUploadData({ title: '', issuer: '', date: '', credentialUrl: '', description: '' });
            toast.success('Certificate uploaded successfully!');
        } catch (error) {
            toast.error('Failed to upload certificate');
        }
    };

    const handlePrint = () => {
        if (!selectedCert) return;

        // If external URL, open it
        if (selectedCert.isExternal && selectedCert.credentialUrl) {
            window.open(selectedCert.credentialUrl, '_blank');
            return;
        }

        // Standard Print Logic for Internal Certs
        const printContent = document.getElementById('certificate-template');
        const win = window.open('', '', 'height=700,width=900');
        win.document.write('<html><head><title>Certificate</title>');
        win.document.write('<style>body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f0f0f0; } .cert { width: 1000px; height: 700px; background: white; padding: 40px; border: 20px solid #1a237e; text-align: center; position: relative; font-family: "Georgia", serif; color: #1a237e; } .title { font-size: 60px; font-weight: bold; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 5px; border-bottom: 2px solid #cccc; padding-bottom: 10px; display: inline-block; } .subtitle { font-size: 24px; margin-bottom: 40px; color: #555; } .recipient { font-size: 50px; font-weight: bold; margin: 30px 0; border-bottom: 2px solid #1a237e; display: inline-block; padding: 0 40px; font-style: italic; color: #000; } .course { font-size: 36px; font-weight: bold; margin: 20px 0; color: #303f9f; } .description { font-size: 18px; max-width: 80%; margin: 0 auto 60px; line-height: 1.6; color: #666; } .footer { display: flex; justify-content: space-between; margin-top: 60px; padding: 0 60px; } .sig-line { border-top: 2px solid #333; width: 200px; padding-top: 10px; font-weight: bold; } .seal { position: absolute; bottom: 50px; left: 50%; transform: translateX(-50%); width: 120px; height: 120px; border-radius: 50%; border: 4px solid #c5a009; color: #c5a009; display: flex; items-center; justify-content: center; font-weight: bold; font-size: 14px; text-transform: uppercase; box-shadow: 0 0 0 10px double #c5a009; text-align: center; background: rgba(255,215,0,0.1); }</style>');
        win.document.write('</head><body>');
        win.document.write(`
      <div class="cert">
        <div class="title">Certificate</div>
        <div class="subtitle">of Completion</div>
        <p>This is to certify that</p>
        <div class="recipient">${selectedCert.recipientName || 'Student Name'}</div>
        <p>has successfully completed the course</p>
        <div class="course">${selectedCert.title}</div>
        <div class="description">${selectedCert.description}</div>
        <p>Issued on ${new Date(selectedCert.completionDate).toLocaleDateString()}</p>
        <div class="seal">Official<br>Verified<br>Credential</div>
        <div class="footer"><div class="sig-line">Instructor</div><div class="sig-line">Platform Director</div></div>
        <div style="margin-top:20px; font-size: 12px; color: #999;">ID: ${selectedCert.certificateId}</div>
      </div>
    `);
        win.document.write('</body></html>');
        win.document.close();
        win.print();
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#0a0a1e]"><div className="w-12 h-12 border-4 border-indigo-500 rounded-full animate-spin border-t-transparent" /></div>;

    return (
        <div className="min-h-screen p-6 relative overflow-hidden" style={{ background: '#0a0a1e' }}>

            {/* COSMIC BACKGROUND */}
            <div className='fixed inset-0 pointer-events-none' style={{ zIndex: 0 }}>
                <div style={{
                    position: 'absolute', inset: 0, opacity: 0.2,
                    backgroundImage: `linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px)`,
                    backgroundSize: '50px 50px',
                    animation: 'moveGrid 20s linear infinite'
                }} />
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[100px] rounded-full" />
            </div>

            <div className="max-w-7xl mx-auto relative z-10">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                        <div className='flex items-center gap-2 mb-2'>
                            <span className='px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-300 text-xs font-bold border border-yellow-500/30'>Verified Credentials</span>
                        </div>
                        <h1 className="text-4xl font-black text-white mb-2">My Portfolio</h1>
                        <p className="text-gray-400">Showcase your verified achievements to the world.</p>
                    </motion.div>

                    <div className='flex gap-3'>
                        <button className='px-6 py-3 rounded-xl bg-slate-800 text-white font-bold border border-white/10 hover:bg-slate-700 transition flex items-center gap-2'>
                            <Share2 size={18} /> Share Profile
                        </button>
                        <button
                            onClick={() => setShowUploadModal(true)}
                            className='px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold shadow-lg hover:shadow-indigo-500/25 transition flex items-center gap-2'
                        >
                            <Upload size={18} /> Upload Certificate
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* LEFT LIST */}
                    <div className="lg:col-span-1 space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                        {certificates.length === 0 ? (
                            <div className="text-center p-8 bg-slate-900/50 rounded-2xl border border-white/10 border-dashed">
                                <Award className="mx-auto text-gray-600 mb-4" size={48} />
                                <p className="text-gray-400">No certificates yet.</p>
                            </div>
                        ) : (
                            certificates.map((cert) => (
                                <motion.div
                                    key={cert._id}
                                    onClick={() => setSelectedCert(cert)}
                                    layoutId={cert._id}
                                    className={`p-5 rounded-2xl cursor-pointer border transition-all relative overflow-hidden group ${selectedCert?._id === cert._id
                                            ? 'bg-indigo-600/20 border-indigo-500 shadow-lg shadow-indigo-500/10'
                                            : 'bg-slate-800/50 border-white/5 hover:bg-slate-800 hover:border-white/10'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className={`p-2 rounded-lg ${cert.isExternal ? 'bg-orange-500/20 text-orange-400' : 'bg-indigo-500/20 text-indigo-400'}`}>
                                            {cert.isExternal ? <Globe size={20} /> : <Award size={20} />}
                                        </div>
                                        {selectedCert?._id === cert._id && <div className='w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_#6366f1]' />}
                                    </div>
                                    <h3 className="font-bold text-white mb-1 line-clamp-1">{cert.title}</h3>
                                    <p className="text-xs text-gray-400 mb-2">{cert.issuer || 'LearnIT Platform'}</p>
                                    <div className="flex items-center gap-2 text-[10px] bg-black/20 w-fit px-2 py-1 rounded text-gray-400">
                                        <CheckCircle size={10} /> Verified
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>

                    {/* RIGHT PREVIEW */}
                    <div className="lg:col-span-2">
                        <AnimatePresence mode='wait'>
                            {selectedCert ? (
                                <motion.div
                                    key={selectedCert._id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="relative"
                                >
                                    {/* Certificate Card */}
                                    <div className="bg-white text-[#1a237e] p-8 md:p-12 rounded-2xl shadow-2xl aspect-[1.414/1] relative overflow-hidden flex flex-col items-center text-center justify-between border-[12px] border-[#1a237e] select-none">

                                        {/* Background Decor */}
                                        <div className="absolute top-0 left-0 w-40 h-40 bg-[#c5a009]/10 rounded-br-full" />
                                        <div className="absolute bottom-0 right-0 w-40 h-40 bg-[#c5a009]/10 rounded-tl-full" />
                                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />

                                        {/* Header */}
                                        <div className="relative z-10 mt-4">
                                            <div className="text-4xl font-serif font-black tracking-[0.2em] uppercase border-b-4 border-[#1a237e]/20 pb-4 mb-2 text-[#1a237e]">
                                                Certificate
                                            </div>
                                            <div className="text-xl font-serif text-[#1a237e]/60 italic font-medium">of Achievement</div>
                                        </div>

                                        {/* Body */}
                                        <div className="relative z-10 w-full max-w-2xl">
                                            <p className="text-sm uppercase tracking-widest text-gray-500 mb-6">This credential is proudly presented to</p>

                                            <h2 className="text-4xl md:text-5xl font-serif font-bold italic text-black border-b-2 border-[#1a237e]/30 inline-block px-12 mb-8 pb-4">
                                                {selectedCert.recipientName || 'Student Name'}
                                            </h2>

                                            <p className="text-sm uppercase tracking-widest text-gray-500 mb-4">For successfully completing</p>
                                            <h3 className="text-3xl font-bold text-[#303f9f] mb-4">{selectedCert.title}</h3>
                                            <p className="text-sm text-gray-500 max-w-lg mx-auto leading-relaxed">{selectedCert.description}</p>
                                        </div>

                                        {/* Footer */}
                                        <div className="flex justify-between w-full px-8 z-10 items-end mt-8">
                                            <div className="text-center">
                                                <div className="w-40 border-t-2 border-[#1a237e] pt-2 font-bold text-xs uppercase tracking-wider">Instructor</div>
                                            </div>

                                            {/* Seal */}
                                            <div className="relative w-28 h-28 flex items-center justify-center">
                                                <div className="absolute inset-0 rounded-full border-4 border-[#c5a009]" />
                                                <div className="absolute inset-1 rounded-full border-2 border-[#c5a009] border-dashed" />
                                                <div className="bg-[#c5a009] text-white w-20 h-20 rounded-full flex flex-col items-center justify-center shadow-lg transform rotate-12">
                                                    <Shield size={24} />
                                                    <span className="text-[8px] font-bold mt-1">VERIFIED</span>
                                                </div>
                                            </div>

                                            <div className="text-center">
                                                <div className="text-xs text-gray-500 mb-1">{new Date(selectedCert.completionDate).toLocaleDateString()}</div>
                                                <div className="w-40 border-t-2 border-[#1a237e] pt-2 font-bold text-xs uppercase tracking-wider">Date Issued</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Bar */}
                                    <div className="flex justify-end gap-3 mt-6">
                                        {selectedCert.isExternal ? (
                                            <button
                                                onClick={() => window.open(selectedCert.credentialUrl, '_blank')}
                                                className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-2 shadow-lg hover:shadow-indigo-500/25 transition"
                                            >
                                                <ExternalLink size={18} /> View Original Source
                                            </button>
                                        ) : (
                                            <button
                                                onClick={handlePrint}
                                                className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center gap-2 transition border border-white/10"
                                            >
                                                <Download size={18} /> Download PDF
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="h-full min-h-[500px] flex flex-col items-center justify-center bg-slate-900/30 rounded-3xl border-2 border-dashed border-gray-700">
                                    <Award size={64} className="text-gray-700 mb-4" />
                                    <p className="text-gray-500 text-lg">Select a certificate to view details</p>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* UPLOAD MODAL */}
                <AnimatePresence>
                    {showUploadModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setShowUploadModal(false)}>
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden"
                                onClick={e => e.stopPropagation()}
                            >
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
                                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                                    <Upload className="text-indigo-400" /> Upload Certificate
                                </h2>

                                <form onSubmit={handleUpload} className="space-y-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Certificate Title</label>
                                        <input
                                            type="text" required
                                            placeholder="e.g. AWS Solutions Architect"
                                            value={uploadData.title}
                                            onChange={e => setUploadData({ ...uploadData, title: e.target.value })}
                                            className="w-full p-4 rounded-xl bg-black/40 border border-white/10 text-white focus:border-indigo-500 focus:outline-none"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Issuer</label>
                                            <input
                                                type="text" required
                                                placeholder="e.g. Amazon, Google"
                                                value={uploadData.issuer}
                                                onChange={e => setUploadData({ ...uploadData, issuer: e.target.value })}
                                                className="w-full p-4 rounded-xl bg-black/40 border border-white/10 text-white focus:border-indigo-500 focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Date Issued</label>
                                            <input
                                                type="date" required
                                                value={uploadData.date}
                                                onChange={e => setUploadData({ ...uploadData, date: e.target.value })}
                                                className="w-full p-4 rounded-xl bg-black/40 border border-white/10 text-white focus:border-indigo-500 focus:outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Credential URL (Optional)</label>
                                        <input
                                            type="url"
                                            placeholder="https://..."
                                            value={uploadData.credentialUrl}
                                            onChange={e => setUploadData({ ...uploadData, credentialUrl: e.target.value })}
                                            className="w-full p-4 rounded-xl bg-black/40 border border-white/10 text-white focus:border-indigo-500 focus:outline-none"
                                        />
                                    </div>

                                    <div className="flex gap-4 pt-4">
                                        <button type="button" onClick={() => setShowUploadModal(false)} className="px-6 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 font-bold">Cancel</button>
                                        <button type="submit" className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-500/25">Add to Portfolio</button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

            </div>
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
            `}</style>
        </div>
    );
};

export default CertificatePage;
