import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import LGDIntroduction from './components/LGDIntroduction';
import { DecorativeTitle, FestivalStrip } from './components/Decorations';
import { auth, storage, db } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore';
import { ADMIN_EMAILS } from './config';


function Introduction() {
  const [user, setUser] = useState(null);
  const [members, setMembers] = useState([]);
  const [form, setForm] = useState({
    name: '',
    yearOfBirth: '',
    role: '',
    image: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [uploadingMemberImage, setUploadingMemberImage] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  const isAdmin = user && ADMIN_EMAILS.includes(user.email);

  useEffect(() => {
    const q = query(collection(db, 'members'), orderBy('id', 'asc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        ...doc.data(),
        firestoreId: doc.id // Lưu lại ID của Firestore để update/delete
      }));
      setMembers(docs);
    });
    return () => unsub();
  }, []);


  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddMember = (e) => {
    e.preventDefault();
    if (!user) {
      alert('Bạn cần đăng nhập để thêm/sửa thông tin.');
      return;
    }
    if (!form.name || !form.yearOfBirth || !form.role) return;

    const existingOfUser = members.find(
      (m) => m.owner === user.uid || m.owner === user.email
    );

    // Người thường chỉ được tạo 1 lần (admin không giới hạn)
    if (!editingId && !isAdmin && existingOfUser) {
      alert('Bạn chỉ được thêm thông tin 1 lần. Hãy sửa thông tin đã có.');
      return;
    }

    if (editingId) {
      const target = members.find((m) => m.id === editingId);
      const canEdit =
        isAdmin ||
        target?.owner === user.uid ||
        target?.owner === user.email;
      if (!canEdit) {
        alert('Bạn không được phép sửa thông tin của người khác.');
        return;
      }

      const memberDoc = doc(db, 'members', target.firestoreId);
      updateDoc(memberDoc, {
        name: form.name,
        yearOfBirth: form.yearOfBirth,
        role: form.role,
        image: form.image || 'https://via.placeholder.com/250x250.png?text=Member',
      }).catch(err => console.error("Update error:", err));

    } else {
      const newMember = {
        id: Date.now(),
        owner: user.uid,
        name: form.name,
        yearOfBirth: form.yearOfBirth,
        role: form.role,
        image: form.image || 'https://via.placeholder.com/250x250.png?text=Member',
      };
      addDoc(collection(db, 'members'), newMember)
        .catch(err => console.error("Add error:", err));
    }


    setForm({
      name: '',
      yearOfBirth: '',
      role: '',
      image: '',
    });
    setEditingId(null);
  };

  const handleEditClick = (member) => {
    if (!user) return;
    const canEdit =
      isAdmin ||
      member.owner === user.uid ||
      member.owner === user.email;
    if (!canEdit) {
      alert('Bạn không được phép sửa thông tin của người khác.');
      return;
    }
    setEditingId(member.id);
    setForm({
      name: member.name,
      yearOfBirth: member.yearOfBirth,
      role: member.role,
      image: member.image?.includes?.('placeholder.com') ? '' : (member.image || ''),
    });
  };

  const handleDelete = (member) => {
    if (!user || !isAdmin) {
      alert('Chỉ admin mới được xóa thông tin.');
      return;
    }
    if (window.confirm(`Xóa thành viên ${member.name}?`)) {
      deleteDoc(doc(db, 'members', member.firestoreId))
        .catch(err => console.error("Delete error:", err));
    }
  };

  const handleMemberImageUpload = async (e) => {
    if (!user) return;
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) {
      alert('Vui lòng chọn file ảnh.');
      return;
    }
    setUploadingMemberImage(true);
    try {
      const storageRef = ref(
        storage,
        `members/${user.uid}/${Date.now()}-${file.name}`
      );
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setForm((prev) => ({ ...prev, image: url }));
    } catch (err) {
      console.error(err);
      alert('Upload ảnh lỗi ❌');
    } finally {
      setUploadingMemberImage(false);
      e.target.value = '';
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a' }}>
      <Header />

      <section className="container my-5 lgd-section lgd-pattern-bg">
        <FestivalStrip iconSize={22} />
        <h2 className="text-center mb-4 fw-bold lgd-title-gold" style={{ color: '#eab308', textShadow: '0 0 16px rgba(212,160,18,0.4)' }}>
          <DecorativeTitle showIcons={true}>Thành viên Lục Gia Đường</DecorativeTitle>
        </h2>

        {/* Form chỉ hiển thị khi đã đăng nhập (Firebase) */}
        {user && (
          <form className="row g-3 mb-4" onSubmit={handleAddMember}>
            <div className="col-md-3">
              <input
                type="text"
                className="form-control"
                name="name"
                placeholder="Tên"
                value={form.name}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-2">
              <input
                type="number"
                className="form-control"
                name="yearOfBirth"
                placeholder="Năm sinh"
                value={form.yearOfBirth}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                name="role"
                value={form.role}
                onChange={handleChange}
              >
                <option value="">Chọn vị trí</option>
                <option value="Trống">Trống</option>
                <option value="Lân">Lân</option>
                <option value="Sư">Sư</option>
                <option value="Xõa">Xõa</option>
                <option value="Lố">Lố</option>
              </select>
            </div>
            <div className="col-md-3">
              <input
                type="text"
                className="form-control"
                name="image"
                placeholder="Link ảnh (tùy chọn)"
                value={form.image}
                onChange={handleChange}
              />
              <small className="text-muted">Hoặc upload ảnh bên dưới</small>
              <input
                type="file"
                accept="image/*"
                className="form-control form-control-sm mt-1"
                onChange={handleMemberImageUpload}
                disabled={uploadingMemberImage}
              />
              {uploadingMemberImage && <small style={{ color: '#ef4444' }}>Đang tải lên...</small>}
            </div>
            <div className="col-md-1 d-grid">
              <button type="submit" className="btn" style={{ background: 'linear-gradient(180deg, #c41e3a 0%, #9a1830 100%)', border: '1px solid #d4a012', color: '#fff' }}>
                {editingId ? 'Lưu' : 'Thêm'}
              </button>
            </div>
          </form>
        )}

        {/* Danh sách thẻ thành viên do người dùng nhập */}
        <div className="row g-4">
          {members.map((member) => (
            <div key={member.id} className="col-12 col-sm-6 col-md-3">
              <div className="card h-100 shadow-sm lgd-border-gold" style={{ border: '2px solid rgba(212,160,18,0.4)', backgroundColor: '#1a1510' }}>
                <img
                  src={member.image}
                  className="card-img-top"
                  alt={member.name}
                  style={{ objectFit: 'cover', height: '250px' }}
                />
                <div className="card-body text-center">
                  <h5 className="card-title fw-bold">{member.name}</h5>
                  <p className="card-text mb-1">
                    Năm sinh: {member.yearOfBirth}
                  </p>
                  <p className="card-text text-muted">Vị trí: {member.role}</p>
                  {user && (
                    <div className="d-flex justify-content-center gap-2 mt-2">
                      {(isAdmin ||
                        member.owner === user.uid ||
                        member.owner === user.email) && (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => handleEditClick(member)}
                          >
                            Sửa
                          </button>
                        )}
                      {isAdmin && (
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(member)}
                        >
                          Xóa
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <LGDIntroduction />
      <Footer />
    </div>
  );
}

export default Introduction;
