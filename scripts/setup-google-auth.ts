
import { google } from 'googleapis'
import { createInterface } from 'readline'
import { writeFileSync, readFileSync, existsSync } from 'fs'
import { join } from 'path'
import * as dotenv from 'dotenv'

dotenv.config()

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly']

const readline = createInterface({
    input: process.stdin,
    output: process.stdout,
})

const question = (query: string): Promise<string> =>
    new Promise((resolve) => readline.question(query, resolve))

async function setupAuth() {
    console.log('🔐 Google Sheets API Setup Wizard\n')
    console.log('This script will help you generate a Refresh Token for your .env file.\n')
    console.log('Prerequisites:')
    console.log('1. A Google Cloud Project')
    console.log('2. Google Sheets API enabled')
    console.log('3. OAuth 2.0 Credentials (Client ID & Client Secret)')
    console.log('   -> Create at: https://console.cloud.google.com/apis/credentials')
    console.log('   -> Redirect URI must be: http://localhost:3000 (or whatever you set, e.g. http://localhost:5173)')
    console.log('\nLet\'s get started!\n')

    let clientId = process.env.GOOGLE_CLIENT_ID
    let clientSecret = process.env.GOOGLE_CLIENT_SECRET
    let redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5173'

    if (!clientId || clientId.includes('your_client_id')) {
        clientId = await question('Enter your Client ID: ')
    } else {
        console.log(`Using Client ID from .env: ${clientId.substring(0, 10)}...`)
    }

    if (!clientSecret || clientSecret.includes('your_client_secret')) {
        clientSecret = await question('Enter your Client Secret: ')
    } else {
        console.log('Using Client Secret from .env')
    }

    // confirm redirect URI
    const customRedirect = await question(`Enter Redirect URI [default: ${redirectUri}]: `)
    if (customRedirect && customRedirect.trim()) {
        redirectUri = customRedirect.trim()
    }

    const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri)

    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline', // Critical for refresh token
        scope: SCOPES,
        prompt: 'consent' // Force prompts to ensure we get a refresh token
    })

    console.log('\n🔗 Open this URL in your browser:\n')
    console.log(authUrl)
    console.log('\nAuthorize the app, and you will be redirected to your Redirect URI (likely an error page).')
    console.log('Copy the "code" parameter from the URL bar (everything after code= and before & or end of line).')

    let code = ''
    while (!code) {
        code = await question('Paste the "code" parameter (or full URL) here: ')
        code = code.trim()

        // Handle if user pasted full URL
        if (code.includes('code=')) {
            const match = code.match(/code=([^&]+)/)
            if (match && match[1]) {
                code = decodeURIComponent(match[1])
                console.log('Extracting code from URL...')
            }
        }

        // Handle %2F encoding just in case user pasted encoded code without decoding
        if (code.includes('%')) {
            code = decodeURIComponent(code)
        }

        if (!code) {
            console.log('❌ Input was empty. Please try again.')
        }
    }

    try {
        const { tokens } = await oAuth2Client.getToken(code)

        console.log('\n✅ Success! Here are your credentials:\n')
        console.log(`GOOGLE_CLIENT_ID=${clientId}`)
        console.log(`GOOGLE_CLIENT_SECRET=${clientSecret}`)
        console.log(`GOOGLE_REDIRECT_URI=${redirectUri}`)
        console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`)

        if (!tokens.refresh_token) {
            console.warn('⚠️  No refresh token returned. Did you approve access properly? You might need to revoke access and try again to prompt for consent.')
        } else {
            // Update .env file
            const envPath = join(process.cwd(), '.env')
            let envContent = ''

            if (existsSync(envPath)) {
                envContent = readFileSync(envPath, 'utf-8')
            }

            // Function to update or append a key-value pair
            const updateEnvVar = (key: string, value: string) => {
                const regex = new RegExp(`^${key}=.*`, 'm')
                if (regex.test(envContent)) {
                    envContent = envContent.replace(regex, `${key}=${value}`)
                } else {
                    envContent += `\n${key}=${value}`
                }
            }

            updateEnvVar('GOOGLE_CLIENT_ID', clientId!)
            updateEnvVar('GOOGLE_CLIENT_SECRET', clientSecret!)
            updateEnvVar('GOOGLE_REDIRECT_URI', redirectUri)
            updateEnvVar('GOOGLE_REFRESH_TOKEN', tokens.refresh_token!)

            // Clean up multiple newlines might be nice, but simple append/replace is safer to not mess up formatting
            writeFileSync(envPath, envContent.trim() + '\n')
            console.log(`\n💾 Updated .env file at: ${envPath}`)
        }

    } catch (error) {
        console.error('❌ Error retrieving access token:', error)
    }

    readline.close()
}

setupAuth()
