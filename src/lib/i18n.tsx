import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getLanguage, isRtl } from "@/lib/languages";

export type TranslationKey =
  | "nav.home" | "nav.features" | "nav.pricing" | "nav.about" | "nav.login" | "nav.getStarted"
  | "nav.openApp" | "nav.profile" | "nav.chat" | "nav.images" | "nav.videos" | "nav.settings"
  | "nav.signOut" | "nav.signUp"
  | "settings.title" | "settings.appearance" | "settings.appearanceDesc"
  | "settings.language" | "settings.languageDesc" | "settings.languageSearch"
  | "settings.export" | "settings.exportDesc" | "settings.exportBtn"
  | "settings.signOutDesc" | "settings.delete" | "settings.deleteDesc" | "settings.deleteBtn"
  | "chat.newChat" | "chat.search" | "chat.placeholder" | "chat.send"
  | "common.save" | "common.cancel";

type Dict = Partial<Record<TranslationKey, string>>;

const en: Record<TranslationKey, string> = {
  "nav.home": "Home",
  "nav.features": "Features",
  "nav.pricing": "Pricing",
  "nav.about": "About",
  "nav.login": "Login",
  "nav.getStarted": "Get Started",
  "nav.openApp": "Open App",
  "nav.profile": "Profile",
  "nav.chat": "Chat",
  "nav.images": "Images",
  "nav.videos": "Videos",
  "nav.settings": "Settings",
  "nav.signOut": "Sign out",
  "nav.signUp": "Sign Up",
  "settings.title": "Settings",
  "settings.appearance": "Appearance",
  "settings.appearanceDesc": "Choose light or dark mode.",
  "settings.language": "Language",
  "settings.languageDesc": "Choose the app language. The assistant will also reply in this language.",
  "settings.languageSearch": "Search language...",
  "settings.export": "Export chat history",
  "settings.exportDesc": "Download all your messages as JSON.",
  "settings.exportBtn": "Export",
  "settings.signOutDesc": "Sign out of DashBot on this device.",
  "settings.delete": "Delete account",
  "settings.deleteDesc": "Permanently delete your data. This can't be undone.",
  "settings.deleteBtn": "Delete",
  "chat.newChat": "New Chat",
  "chat.search": "Search chats",
  "chat.placeholder": "Ask anything...",
  "chat.send": "Send",
  "common.save": "Save",
  "common.cancel": "Cancel",
};

const dictionaries: Record<string, Dict> = {
  ar: {
    "nav.home": "الرئيسية", "nav.features": "المزايا", "nav.pricing": "الأسعار", "nav.about": "من نحن",
    "nav.login": "تسجيل الدخول", "nav.getStarted": "ابدأ الآن", "nav.openApp": "فتح التطبيق",
    "nav.profile": "الملف الشخصي", "nav.chat": "المحادثة", "nav.images": "الصور", "nav.videos": "الفيديوهات",
    "nav.settings": "الإعدادات", "nav.signOut": "تسجيل الخروج", "nav.signUp": "إنشاء حساب",
    "settings.title": "الإعدادات", "settings.appearance": "المظهر", "settings.appearanceDesc": "اختر الوضع الفاتح أو الداكن.",
    "settings.language": "اللغة", "settings.languageDesc": "اختر لغة التطبيق. سيرد المساعد بهذه اللغة أيضًا.",
    "settings.languageSearch": "ابحث عن لغة...",
    "settings.export": "تصدير سجل المحادثات", "settings.exportDesc": "نزّل جميع رسائلك بصيغة JSON.", "settings.exportBtn": "تصدير",
    "settings.signOutDesc": "تسجيل الخروج من DashBot على هذا الجهاز.",
    "settings.delete": "حذف الحساب", "settings.deleteDesc": "حذف بياناتك نهائيًا. لا يمكن التراجع عن ذلك.", "settings.deleteBtn": "حذف",
    "chat.newChat": "محادثة جديدة", "chat.search": "بحث في المحادثات", "chat.placeholder": "اسأل أي شيء...", "chat.send": "إرسال",
    "common.save": "حفظ", "common.cancel": "إلغاء",
  },
  es: {
    "nav.home": "Inicio", "nav.features": "Funciones", "nav.pricing": "Precios", "nav.about": "Acerca de",
    "nav.login": "Iniciar sesión", "nav.getStarted": "Empezar", "nav.openApp": "Abrir app",
    "nav.profile": "Perfil", "nav.chat": "Chat", "nav.images": "Imágenes", "nav.videos": "Vídeos",
    "nav.settings": "Ajustes", "nav.signOut": "Cerrar sesión", "nav.signUp": "Registrarse",
    "settings.title": "Ajustes", "settings.appearance": "Apariencia", "settings.appearanceDesc": "Elige el modo claro u oscuro.",
    "settings.language": "Idioma", "settings.languageDesc": "Elige el idioma de la app. El asistente también responderá en este idioma.",
    "settings.languageSearch": "Buscar idioma...",
    "settings.export": "Exportar historial", "settings.exportDesc": "Descarga todos tus mensajes en JSON.", "settings.exportBtn": "Exportar",
    "settings.signOutDesc": "Cerrar sesión de DashBot en este dispositivo.",
    "settings.delete": "Eliminar cuenta", "settings.deleteDesc": "Elimina tus datos permanentemente. No se puede deshacer.", "settings.deleteBtn": "Eliminar",
    "chat.newChat": "Nuevo chat", "chat.search": "Buscar chats", "chat.placeholder": "Pregunta lo que quieras...", "chat.send": "Enviar",
    "common.save": "Guardar", "common.cancel": "Cancelar",
  },
  fr: {
    "nav.home": "Accueil", "nav.features": "Fonctionnalités", "nav.pricing": "Tarifs", "nav.about": "À propos",
    "nav.login": "Connexion", "nav.getStarted": "Commencer", "nav.openApp": "Ouvrir l'app",
    "nav.profile": "Profil", "nav.chat": "Chat", "nav.images": "Images", "nav.videos": "Vidéos",
    "nav.settings": "Paramètres", "nav.signOut": "Se déconnecter", "nav.signUp": "S'inscrire",
    "settings.title": "Paramètres", "settings.appearance": "Apparence", "settings.appearanceDesc": "Choisissez le mode clair ou sombre.",
    "settings.language": "Langue", "settings.languageDesc": "Choisissez la langue de l'app. L'assistant répondra aussi dans cette langue.",
    "settings.languageSearch": "Rechercher une langue...",
    "settings.export": "Exporter l'historique", "settings.exportDesc": "Téléchargez tous vos messages en JSON.", "settings.exportBtn": "Exporter",
    "settings.signOutDesc": "Se déconnecter de DashBot sur cet appareil.",
    "settings.delete": "Supprimer le compte", "settings.deleteDesc": "Supprimez définitivement vos données. Irréversible.", "settings.deleteBtn": "Supprimer",
    "chat.newChat": "Nouveau chat", "chat.search": "Rechercher", "chat.placeholder": "Posez votre question...", "chat.send": "Envoyer",
    "common.save": "Enregistrer", "common.cancel": "Annuler",
  },
  hi: {
    "nav.home": "होम", "nav.features": "विशेषताएँ", "nav.pricing": "मूल्य", "nav.about": "हमारे बारे में",
    "nav.login": "लॉगिन", "nav.getStarted": "शुरू करें", "nav.openApp": "ऐप खोलें",
    "nav.profile": "प्रोफ़ाइल", "nav.chat": "चैट", "nav.images": "छवियाँ", "nav.videos": "वीडियो",
    "nav.settings": "सेटिंग्स", "nav.signOut": "साइन आउट", "nav.signUp": "साइन अप",
    "settings.title": "सेटिंग्स", "settings.appearance": "रूप", "settings.appearanceDesc": "लाइट या डार्क मोड चुनें।",
    "settings.language": "भाषा", "settings.languageDesc": "ऐप की भाषा चुनें। सहायक भी इसी भाषा में उत्तर देगा।",
    "settings.languageSearch": "भाषा खोजें...",
    "settings.export": "चैट इतिहास निर्यात करें", "settings.exportDesc": "अपने सभी संदेश JSON में डाउनलोड करें।", "settings.exportBtn": "निर्यात",
    "settings.signOutDesc": "इस डिवाइस पर DashBot से साइन आउट करें।",
    "settings.delete": "खाता हटाएँ", "settings.deleteDesc": "आपका डेटा हमेशा के लिए हट जाएगा।", "settings.deleteBtn": "हटाएँ",
    "chat.newChat": "नई चैट", "chat.search": "चैट खोजें", "chat.placeholder": "कुछ भी पूछें...", "chat.send": "भेजें",
    "common.save": "सहेजें", "common.cancel": "रद्द करें",
  },
  de: {
    "nav.home": "Start", "nav.features": "Funktionen", "nav.pricing": "Preise", "nav.about": "Über uns",
    "nav.login": "Anmelden", "nav.getStarted": "Loslegen", "nav.openApp": "App öffnen",
    "nav.profile": "Profil", "nav.chat": "Chat", "nav.images": "Bilder", "nav.videos": "Videos",
    "nav.settings": "Einstellungen", "nav.signOut": "Abmelden", "nav.signUp": "Registrieren",
    "settings.title": "Einstellungen", "settings.appearance": "Darstellung", "settings.appearanceDesc": "Hell oder dunkel wählen.",
    "settings.language": "Sprache", "settings.languageDesc": "Sprache der App wählen. Der Assistent antwortet ebenfalls in dieser Sprache.",
    "settings.languageSearch": "Sprache suchen...",
    "settings.export": "Chatverlauf exportieren", "settings.exportDesc": "Alle Nachrichten als JSON herunterladen.", "settings.exportBtn": "Exportieren",
    "settings.signOutDesc": "Auf diesem Gerät von DashBot abmelden.",
    "settings.delete": "Konto löschen", "settings.deleteDesc": "Daten dauerhaft löschen. Nicht umkehrbar.", "settings.deleteBtn": "Löschen",
    "chat.newChat": "Neuer Chat", "chat.search": "Chats suchen", "chat.placeholder": "Frag mich etwas...", "chat.send": "Senden",
    "common.save": "Speichern", "common.cancel": "Abbrechen",
  },
  pt: {
    "nav.home": "Início", "nav.features": "Recursos", "nav.pricing": "Preços", "nav.about": "Sobre",
    "nav.login": "Entrar", "nav.getStarted": "Começar", "nav.openApp": "Abrir app",
    "nav.profile": "Perfil", "nav.chat": "Chat", "nav.images": "Imagens", "nav.videos": "Vídeos",
    "nav.settings": "Configurações", "nav.signOut": "Sair", "nav.signUp": "Criar conta",
    "settings.title": "Configurações", "settings.appearance": "Aparência", "settings.appearanceDesc": "Escolha o modo claro ou escuro.",
    "settings.language": "Idioma", "settings.languageDesc": "Escolha o idioma do app. O assistente também responderá nesse idioma.",
    "settings.languageSearch": "Buscar idioma...",
    "settings.export": "Exportar histórico", "settings.exportDesc": "Baixe todas as mensagens em JSON.", "settings.exportBtn": "Exportar",
    "settings.signOutDesc": "Sair do DashBot neste dispositivo.",
    "settings.delete": "Excluir conta", "settings.deleteDesc": "Excluir seus dados permanentemente.", "settings.deleteBtn": "Excluir",
    "chat.newChat": "Novo chat", "chat.search": "Buscar chats", "chat.placeholder": "Pergunte qualquer coisa...", "chat.send": "Enviar",
    "common.save": "Salvar", "common.cancel": "Cancelar",
  },
  ru: {
    "nav.home": "Главная", "nav.features": "Возможности", "nav.pricing": "Цены", "nav.about": "О нас",
    "nav.login": "Войти", "nav.getStarted": "Начать", "nav.openApp": "Открыть",
    "nav.profile": "Профиль", "nav.chat": "Чат", "nav.images": "Изображения", "nav.videos": "Видео",
    "nav.settings": "Настройки", "nav.signOut": "Выйти", "nav.signUp": "Регистрация",
    "settings.title": "Настройки", "settings.appearance": "Оформление", "settings.appearanceDesc": "Светлая или тёмная тема.",
    "settings.language": "Язык", "settings.languageDesc": "Выберите язык приложения. Ассистент тоже будет отвечать на нём.",
    "settings.languageSearch": "Поиск языка...",
    "settings.export": "Экспорт истории", "settings.exportDesc": "Скачать все сообщения в JSON.", "settings.exportBtn": "Экспорт",
    "settings.signOutDesc": "Выйти из DashBot на этом устройстве.",
    "settings.delete": "Удалить аккаунт", "settings.deleteDesc": "Безвозвратно удалить данные.", "settings.deleteBtn": "Удалить",
    "chat.newChat": "Новый чат", "chat.search": "Поиск чатов", "chat.placeholder": "Спросите что угодно...", "chat.send": "Отправить",
    "common.save": "Сохранить", "common.cancel": "Отмена",
  },
  zh: {
    "nav.home": "首页", "nav.features": "功能", "nav.pricing": "价格", "nav.about": "关于",
    "nav.login": "登录", "nav.getStarted": "开始使用", "nav.openApp": "打开应用",
    "nav.profile": "个人资料", "nav.chat": "聊天", "nav.images": "图片", "nav.videos": "视频",
    "nav.settings": "设置", "nav.signOut": "退出登录", "nav.signUp": "注册",
    "settings.title": "设置", "settings.appearance": "外观", "settings.appearanceDesc": "选择浅色或深色模式。",
    "settings.language": "语言", "settings.languageDesc": "选择应用语言，助手也会用该语言回复。",
    "settings.languageSearch": "搜索语言...",
    "settings.export": "导出聊天记录", "settings.exportDesc": "以 JSON 下载全部消息。", "settings.exportBtn": "导出",
    "settings.signOutDesc": "在此设备退出 DashBot。",
    "settings.delete": "删除账户", "settings.deleteDesc": "永久删除数据，无法恢复。", "settings.deleteBtn": "删除",
    "chat.newChat": "新对话", "chat.search": "搜索对话", "chat.placeholder": "问我任何问题...", "chat.send": "发送",
    "common.save": "保存", "common.cancel": "取消",
  },
  ja: {
    "nav.home": "ホーム", "nav.features": "機能", "nav.pricing": "料金", "nav.about": "概要",
    "nav.login": "ログイン", "nav.getStarted": "始める", "nav.openApp": "アプリを開く",
    "nav.profile": "プロフィール", "nav.chat": "チャット", "nav.images": "画像", "nav.videos": "動画",
    "nav.settings": "設定", "nav.signOut": "ログアウト", "nav.signUp": "登録",
    "settings.title": "設定", "settings.appearance": "外観", "settings.appearanceDesc": "ライトまたはダークを選択。",
    "settings.language": "言語", "settings.languageDesc": "アプリの言語を選択します。アシスタントも同じ言語で返答します。",
    "settings.languageSearch": "言語を検索...",
    "settings.export": "チャット履歴をエクスポート", "settings.exportDesc": "すべてのメッセージを JSON でダウンロード。", "settings.exportBtn": "エクスポート",
    "settings.signOutDesc": "この端末で DashBot からログアウトします。",
    "settings.delete": "アカウント削除", "settings.deleteDesc": "データを完全に削除します。", "settings.deleteBtn": "削除",
    "chat.newChat": "新しいチャット", "chat.search": "チャットを検索", "chat.placeholder": "何でも聞いてください...", "chat.send": "送信",
    "common.save": "保存", "common.cancel": "キャンセル",
  },
  ko: {
    "nav.home": "홈", "nav.features": "기능", "nav.pricing": "요금제", "nav.about": "소개",
    "nav.login": "로그인", "nav.getStarted": "시작하기", "nav.openApp": "앱 열기",
    "nav.profile": "프로필", "nav.chat": "채팅", "nav.images": "이미지", "nav.videos": "동영상",
    "nav.settings": "설정", "nav.signOut": "로그아웃", "nav.signUp": "가입",
    "settings.title": "설정", "settings.appearance": "테마", "settings.appearanceDesc": "밝게 또는 어둡게 선택하세요.",
    "settings.language": "언어", "settings.languageDesc": "앱 언어를 선택하세요. 어시스턴트도 같은 언어로 답합니다.",
    "settings.languageSearch": "언어 검색...",
    "settings.export": "대화 내보내기", "settings.exportDesc": "모든 메시지를 JSON으로 다운로드.", "settings.exportBtn": "내보내기",
    "settings.signOutDesc": "이 기기에서 DashBot 로그아웃.",
    "settings.delete": "계정 삭제", "settings.deleteDesc": "데이터를 영구 삭제합니다.", "settings.deleteBtn": "삭제",
    "chat.newChat": "새 채팅", "chat.search": "채팅 검색", "chat.placeholder": "무엇이든 물어보세요...", "chat.send": "보내기",
    "common.save": "저장", "common.cancel": "취소",
  },
  tr: {
    "nav.home": "Ana Sayfa", "nav.features": "Özellikler", "nav.pricing": "Fiyatlar", "nav.about": "Hakkında",
    "nav.login": "Giriş", "nav.getStarted": "Başla", "nav.openApp": "Uygulamayı Aç",
    "nav.profile": "Profil", "nav.chat": "Sohbet", "nav.images": "Görseller", "nav.videos": "Videolar",
    "nav.settings": "Ayarlar", "nav.signOut": "Çıkış yap", "nav.signUp": "Kayıt ol",
    "settings.title": "Ayarlar", "settings.appearance": "Görünüm", "settings.appearanceDesc": "Açık veya koyu modu seçin.",
    "settings.language": "Dil", "settings.languageDesc": "Uygulama dilini seçin. Asistan da bu dilde yanıt verir.",
    "settings.languageSearch": "Dil ara...",
    "settings.export": "Sohbet geçmişini dışa aktar", "settings.exportDesc": "Tüm mesajları JSON olarak indir.", "settings.exportBtn": "Dışa aktar",
    "settings.signOutDesc": "Bu cihazda DashBot oturumunu kapat.",
    "settings.delete": "Hesabı sil", "settings.deleteDesc": "Verileriniz kalıcı olarak silinir.", "settings.deleteBtn": "Sil",
    "chat.newChat": "Yeni sohbet", "chat.search": "Sohbet ara", "chat.placeholder": "Bir şey sorun...", "chat.send": "Gönder",
    "common.save": "Kaydet", "common.cancel": "İptal",
  },
  it: {
    "nav.home": "Home", "nav.features": "Funzioni", "nav.pricing": "Prezzi", "nav.about": "Chi siamo",
    "nav.login": "Accedi", "nav.getStarted": "Inizia", "nav.openApp": "Apri app",
    "nav.profile": "Profilo", "nav.chat": "Chat", "nav.images": "Immagini", "nav.videos": "Video",
    "nav.settings": "Impostazioni", "nav.signOut": "Esci", "nav.signUp": "Registrati",
    "settings.title": "Impostazioni", "settings.appearance": "Aspetto", "settings.appearanceDesc": "Scegli modalità chiara o scura.",
    "settings.language": "Lingua", "settings.languageDesc": "Scegli la lingua dell'app. L'assistente risponderà nella stessa lingua.",
    "settings.languageSearch": "Cerca lingua...",
    "settings.export": "Esporta cronologia", "settings.exportDesc": "Scarica tutti i messaggi in JSON.", "settings.exportBtn": "Esporta",
    "settings.signOutDesc": "Esci da DashBot su questo dispositivo.",
    "settings.delete": "Elimina account", "settings.deleteDesc": "Elimina definitivamente i tuoi dati.", "settings.deleteBtn": "Elimina",
    "chat.newChat": "Nuova chat", "chat.search": "Cerca chat", "chat.placeholder": "Chiedi qualsiasi cosa...", "chat.send": "Invia",
    "common.save": "Salva", "common.cancel": "Annulla",
  },
  id: {
    "nav.home": "Beranda", "nav.features": "Fitur", "nav.pricing": "Harga", "nav.about": "Tentang",
    "nav.login": "Masuk", "nav.getStarted": "Mulai", "nav.openApp": "Buka Aplikasi",
    "nav.profile": "Profil", "nav.chat": "Obrolan", "nav.images": "Gambar", "nav.videos": "Video",
    "nav.settings": "Pengaturan", "nav.signOut": "Keluar", "nav.signUp": "Daftar",
    "settings.title": "Pengaturan", "settings.appearance": "Tampilan", "settings.appearanceDesc": "Pilih mode terang atau gelap.",
    "settings.language": "Bahasa", "settings.languageDesc": "Pilih bahasa aplikasi. Asisten juga akan menjawab dalam bahasa ini.",
    "settings.languageSearch": "Cari bahasa...",
    "settings.export": "Ekspor riwayat obrolan", "settings.exportDesc": "Unduh semua pesan sebagai JSON.", "settings.exportBtn": "Ekspor",
    "settings.signOutDesc": "Keluar dari DashBot di perangkat ini.",
    "settings.delete": "Hapus akun", "settings.deleteDesc": "Hapus data Anda secara permanen.", "settings.deleteBtn": "Hapus",
    "chat.newChat": "Obrolan baru", "chat.search": "Cari obrolan", "chat.placeholder": "Tanya apa saja...", "chat.send": "Kirim",
    "common.save": "Simpan", "common.cancel": "Batal",
  },
  ur: {
    "nav.home": "ہوم", "nav.features": "خصوصیات", "nav.pricing": "قیمتیں", "nav.about": "تعارف",
    "nav.login": "لاگ ان", "nav.getStarted": "شروع کریں", "nav.openApp": "ایپ کھولیں",
    "nav.profile": "پروفائل", "nav.chat": "چیٹ", "nav.images": "تصاویر", "nav.videos": "ویڈیوز",
    "nav.settings": "ترتیبات", "nav.signOut": "سائن آؤٹ", "nav.signUp": "سائن اپ",
    "settings.title": "ترتیبات", "settings.appearance": "ظاہری شکل", "settings.appearanceDesc": "لائٹ یا ڈارک موڈ منتخب کریں۔",
    "settings.language": "زبان", "settings.languageDesc": "ایپ کی زبان منتخب کریں۔ اسسٹنٹ بھی اسی زبان میں جواب دے گا۔",
    "settings.languageSearch": "زبان تلاش کریں...",
    "settings.export": "چیٹ ایکسپورٹ کریں", "settings.exportDesc": "تمام پیغامات JSON میں ڈاؤن لوڈ کریں۔", "settings.exportBtn": "ایکسپورٹ",
    "settings.signOutDesc": "اس ڈیوائس پر DashBot سے سائن آؤٹ کریں۔",
    "settings.delete": "اکاؤنٹ حذف کریں", "settings.deleteDesc": "آپ کا ڈیٹا مستقل حذف ہو جائے گا۔", "settings.deleteBtn": "حذف",
    "chat.newChat": "نئی چیٹ", "chat.search": "چیٹ تلاش کریں", "chat.placeholder": "کچھ بھی پوچھیں...", "chat.send": "بھیجیں",
    "common.save": "محفوظ کریں", "common.cancel": "منسوخ",
  },
  bn: {
    "nav.home": "হোম", "nav.features": "বৈশিষ্ট্য", "nav.pricing": "মূল্য", "nav.about": "সম্পর্কে",
    "nav.login": "লগইন", "nav.getStarted": "শুরু করুন", "nav.openApp": "অ্যাপ খুলুন",
    "nav.profile": "প্রোফাইল", "nav.chat": "চ্যাট", "nav.images": "ছবি", "nav.videos": "ভিডিও",
    "nav.settings": "সেটিংস", "nav.signOut": "সাইন আউট", "nav.signUp": "সাইন আপ",
    "settings.title": "সেটিংস", "settings.appearance": "চেহারা", "settings.appearanceDesc": "লাইট বা ডার্ক মোড বেছে নিন।",
    "settings.language": "ভাষা", "settings.languageDesc": "অ্যাপের ভাষা বাছুন। সহকারীও এই ভাষায় উত্তর দেবে।",
    "settings.languageSearch": "ভাষা খুঁজুন...",
    "settings.export": "চ্যাট ইতিহাস রপ্তানি", "settings.exportDesc": "সব বার্তা JSON হিসেবে ডাউনলোড করুন।", "settings.exportBtn": "রপ্তানি",
    "settings.signOutDesc": "এই ডিভাইসে DashBot থেকে সাইন আউট করুন।",
    "settings.delete": "অ্যাকাউন্ট মুছুন", "settings.deleteDesc": "আপনার ডেটা স্থায়ীভাবে মুছে যাবে।", "settings.deleteBtn": "মুছুন",
    "chat.newChat": "নতুন চ্যাট", "chat.search": "চ্যাট খুঁজুন", "chat.placeholder": "যা খুশি জিজ্ঞাসা করুন...", "chat.send": "পাঠান",
    "common.save": "সংরক্ষণ", "common.cancel": "বাতিল",
  },
};

const STORAGE_KEY = "dashbot-language";

type I18nValue = {
  lang: string;
  setLang: (code: string) => void;
  t: (key: TranslationKey) => string;
  dir: "ltr" | "rtl";
};

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState("en");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setLangState(stored);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = lang;
    document.documentElement.dir = isRtl(lang) ? "rtl" : "ltr";
  }, [lang]);

  const setLang = useCallback((code: string) => {
    setLangState(code);
    try { localStorage.setItem(STORAGE_KEY, code); } catch { /* ignore */ }
  }, []);

  const t = useCallback(
    (key: TranslationKey) => dictionaries[lang]?.[key] ?? dictionaries[lang.split("-")[0]]?.[key] ?? en[key],
    [lang],
  );

  const value = useMemo<I18nValue>(
    () => ({ lang, setLang, t, dir: isRtl(lang) ? "rtl" : "ltr" }),
    [lang, setLang, t],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}

export function useLanguageName() {
  const { lang } = useI18n();
  return getLanguage(lang).name;
}
