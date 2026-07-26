export const buildBookShareText = (book, quote) =>
  `${quote}\n\n${book.title} — ${book.author}\nĐọc ngay trên Mika Books: mikabooks://book/${book.id}`;
