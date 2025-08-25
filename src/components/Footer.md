# Footer Component

Reusable footer component dengan opsi untuk menyembunyikan hero section.

## Props

| Prop      | Type      | Default | Description                                         |
| --------- | --------- | ------- | --------------------------------------------------- |
| `showCTA` | `boolean` | `true`  | Menampilkan atau menyembunyikan footer-hero section |

## Struktur Komponen

Footer terdiri dari beberapa section:

1. **Hero Section** (opsional) - Call-to-action dengan background illustration
2. **Main Footer** - Logo, navigation links, dan copyright
3. **Signup Section** - Email signup form

## Contoh Penggunaan

### Default Footer (dengan CTA)

```astro
<Footer />
```

### Footer tanpa CTA Section

```astro
<Footer showCTA={false} />
```

### Conditional CTA berdasarkan halaman

```astro
<Footer showCTA={page.id !== 'public-slack'} />
```

## Kapan Menggunakan showCTA={false}

- **Halaman yang sudah memiliki CTA** - Jika halaman sudah memiliki call-to-action di bagian lain
- **Halaman minimalis** - Untuk halaman yang ingin terlihat lebih clean
- **Halaman khusus** - Seperti halaman error, maintenance, atau halaman yang tidak memerlukan CTA
- **Halaman dengan layout berbeda** - Yang tidak sesuai dengan hero section

## Sections yang Selalu Ditampilkan

Bahkan ketika `showCTA={false}`, footer tetap menampilkan:

- Logo Datum
- Navigation links (Product, Company, Resources, etc.)
- GitHub button dengan star count
- Copyright dan legal links
- Email signup form

## CSS Classes

Footer menggunakan CSS classes yang sudah didefinisikan di:

- `src/v1/styles/components.css` - Footer component styles
- `src/v1/styles/global.css` - Base styles

### Conditional Classes

- Ketika `showCTA={false}`, footer akan menambahkan class `pt-10` untuk memberikan padding top yang lebih besar
- Ketika `showCTA={true}` (default), footer menggunakan styling normal tanpa padding tambahan
