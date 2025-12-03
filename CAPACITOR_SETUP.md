# METAFIT - Configuração Capacitor para Play Store e App Store

## Pré-requisitos

### Para Android (Play Store):
- Android Studio instalado
- JDK 17 ou superior
- Conta de desenvolvedor Google Play ($25 USD, pagamento único)

### Para iOS (App Store):
- Mac com macOS
- Xcode instalado
- Conta Apple Developer Program ($99 USD/ano)

---

## Passos para Configurar

### 1. Exportar o Projeto para GitHub

1. No Lovable, clica no botão **"Export to GitHub"** no canto superior direito
2. Conecta a tua conta GitHub se ainda não estiver conectada
3. Cria um novo repositório ou seleciona um existente

### 2. Clonar e Configurar Localmente

```bash
# Clonar o repositório
git clone https://github.com/SEU_USUARIO/metafit.git
cd metafit

# Instalar dependências
npm install

# Inicializar Capacitor (já configurado)
npx cap init

# Build do projeto
npm run build

# Adicionar plataformas
npx cap add android
npx cap add ios

# Sincronizar
npx cap sync
```

### 3. Gerar Ícones e Splash Screens

#### Usando @capacitor/assets (Recomendado):

```bash
# Instalar ferramenta de assets
npm install -D @capacitor/assets

# Criar pasta resources com os arquivos base
mkdir -p resources

# Colocar os seguintes arquivos na pasta resources:
# - icon.png (1024x1024px) - ícone do app
# - splash.png (2732x2732px) - splash screen

# Gerar todos os assets
npx capacitor-assets generate
```

#### Especificações dos Assets:

**icon.png** (1024x1024px):
- PNG com fundo sólido (não transparente para Android)
- Sem bordas arredondadas (Android aplica automaticamente)

**splash.png** (2732x2732px):
- PNG com o logo centralizado
- Área segura central de 1200x1200px para o conteúdo principal
- Cor de fundo: #FCF8F3

---

## 4. Configurar para Android (Play Store)

### Abrir no Android Studio:
```bash
npx cap open android
```

### Configurar para Release:

1. **Gerar Keystore** (apenas uma vez):
```bash
keytool -genkey -v -keystore metafit-release-key.keystore -alias metafit -keyalg RSA -keysize 2048 -validity 10000
```

2. **Criar arquivo `android/keystore.properties`**:
```properties
storePassword=SUA_SENHA
keyPassword=SUA_SENHA
keyAlias=metafit
storeFile=../metafit-release-key.keystore
```

3. **Editar `android/app/build.gradle`** - adicionar antes de `android {`:
```gradle
def keystorePropertiesFile = rootProject.file("keystore.properties")
def keystoreProperties = new Properties()
keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
```

4. **Adicionar dentro de `android {`**:
```gradle
signingConfigs {
    release {
        keyAlias keystoreProperties['keyAlias']
        keyPassword keystoreProperties['keyPassword']
        storeFile file(keystoreProperties['storeFile'])
        storePassword keystoreProperties['storePassword']
    }
}
buildTypes {
    release {
        signingConfig signingConfigs.release
        minifyEnabled true
        proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
    }
}
```

5. **Build do APK/AAB**:
```bash
cd android
./gradlew assembleRelease  # Para APK
./gradlew bundleRelease    # Para AAB (recomendado para Play Store)
```

O arquivo estará em: `android/app/build/outputs/bundle/release/app-release.aab`

---

## 5. Configurar para iOS (App Store)

### Abrir no Xcode:
```bash
npx cap open ios
```

### No Xcode:

1. Seleciona o target **App**
2. Em **Signing & Capabilities**:
   - Seleciona tua Team (Apple Developer Account)
   - Define o Bundle Identifier: `app.lovable.6c2c0850231041968df59d0823bba40c`

3. Em **General**:
   - Version: 1.0.0
   - Build: 1

4. **Archive para distribuição**:
   - Menu: Product → Archive
   - Após archive, clica em "Distribute App"
   - Seleciona "App Store Connect"

---

## 6. Publicar na Play Store

1. Acede a [Google Play Console](https://play.google.com/console)
2. Cria nova aplicação
3. Preenche informações:
   - Nome: METAFIT
   - Descrição curta: Nutrientes sob controle
   - Descrição completa: (usar texto do About)
   - Categoria: Saúde e Fitness
   - Screenshots (mínimo 2)
   - Ícone 512x512
   - Banner 1024x500

4. Upload do AAB na secção "Produção"
5. Submete para revisão

---

## 7. Publicar na App Store

1. Acede a [App Store Connect](https://appstoreconnect.apple.com)
2. Cria nova aplicação
3. Preenche informações:
   - Nome: METAFIT
   - Subtítulo: Nutrientes sob controle
   - Descrição: (usar texto do About)
   - Categoria: Saúde e Fitness
   - Screenshots para cada tamanho de dispositivo
   - Ícone 1024x1024

4. Submete para revisão após upload via Xcode

---

## Comandos Úteis

```bash
# Sincronizar após mudanças no código
npx cap sync

# Abrir projeto Android
npx cap open android

# Abrir projeto iOS
npx cap open ios

# Correr no dispositivo Android
npx cap run android

# Correr no dispositivo iOS
npx cap run ios

# Build de produção
npm run build && npx cap sync
```

---

## Modo de Desenvolvimento vs Produção

### Desenvolvimento (atual):
O `capacitor.config.ts` está configurado com `server.url` apontando para o sandbox do Lovable, permitindo hot-reload durante desenvolvimento.

### Produção:
Antes de publicar nas lojas, **remova ou comente** a secção `server` no `capacitor.config.ts`:

```typescript
const config: CapacitorConfig = {
  appId: 'app.lovable.6c2c0850231041968df59d0823bba40c',
  appName: 'METAFIT',
  webDir: 'dist',
  // server: { ... } // COMENTAR PARA PRODUÇÃO
  plugins: {
    // ...
  },
};
```

Isto fará com que o app use os ficheiros locais do build em vez do servidor remoto.

---

## Checklist Final

- [ ] Exportar projeto para GitHub
- [ ] Clonar e instalar dependências
- [ ] Gerar ícones e splash screens
- [ ] Adicionar plataformas (Android/iOS)
- [ ] Testar em dispositivo real
- [ ] Configurar assinatura (keystore/provisioning)
- [ ] Remover server.url do capacitor.config.ts
- [ ] Build de produção
- [ ] Criar conta de desenvolvedor (Google/Apple)
- [ ] Preencher informações da loja
- [ ] Submeter para revisão

---

## Suporte

Para dúvidas sobre o processo:
- [Documentação Capacitor](https://capacitorjs.com/docs)
- [Guia Play Store](https://developer.android.com/distribute)
- [Guia App Store](https://developer.apple.com/app-store/)
