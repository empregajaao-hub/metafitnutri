# Configuração de Permissões Android - METAFIT

## Passo 1: Adicionar Plataforma Android

Se ainda não adicionaste a plataforma Android, executa:

```bash
npx cap add android
```

## Passo 2: Configurar Permissões de Câmara e Galeria

Após adicionar a plataforma Android, edita o ficheiro:
`android/app/src/main/AndroidManifest.xml`

Adiciona estas permissões dentro da tag `<manifest>`, antes de `<application>`:

```xml
<!-- Permissões de Câmara -->
<uses-permission android:name="android.permission.CAMERA" />
<uses-feature android:name="android.hardware.camera" android:required="false" />
<uses-feature android:name="android.hardware.camera.autofocus" android:required="false" />

<!-- Permissões de Galeria/Armazenamento -->
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />

<!-- Para Android 13+ (API 33+) -->
<uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
```

## Passo 3: Exemplo Completo do AndroidManifest.xml

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <!-- Permissões de Câmara -->
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-feature android:name="android.hardware.camera" android:required="false" />
    <uses-feature android:name="android.hardware.camera.autofocus" android:required="false" />

    <!-- Permissões de Galeria/Armazenamento -->
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />

    <!-- Permissão de Internet -->
    <uses-permission android:name="android.permission.INTERNET" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/AppTheme">
        
        <!-- ... resto da configuração ... -->
        
    </application>
</manifest>
```

## Passo 4: Sincronizar e Testar

Após editar o AndroidManifest.xml:

```bash
npx cap sync android
npx cap run android
```

## Comportamento Esperado

Quando o utilizador clicar em "Tirar Foto" ou "Enviar da Galeria", o Android irá mostrar um diálogo de permissão semelhante ao do iOS:

- **"METAFIT NUTRI" quer aceder à câmara** → Permitir / Negar
- **"METAFIT NUTRI" quer aceder às fotos** → Permitir / Negar

## Notas Importantes

1. **Android 6.0+ (API 23+)**: As permissões são pedidas em runtime automaticamente pelo Capacitor
2. **Android 13+ (API 33+)**: Usa `READ_MEDIA_IMAGES` em vez de `READ_EXTERNAL_STORAGE` para fotos
3. O Capacitor gere automaticamente os pedidos de permissão quando o utilizador interage com os inputs de ficheiro

## Verificar no Código

O código atual em `src/pages/Upload.tsx` já está configurado corretamente com:
- `capture="environment"` para ativar a câmara traseira
- `accept="image/*"` para aceitar todos os tipos de imagem

O Capacitor converte automaticamente estes atributos HTML em pedidos de permissão nativos.
