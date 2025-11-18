#!/usr/bin/env node

import { spawn } from 'child_process'
import { mkdir, rm, writeFile, appendFile } from 'fs/promises'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

// Get project root directory
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..')
const tmpDir = join(projectRoot, 'tmp')

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
}

// Parse CLI args
const numRuns = parseInt(process.argv[2]) || 10

async function setup() {
  // Create tmp directory
  await mkdir(tmpDir, { recursive: true })

  // Clean up old log files
  try {
    await rm(join(tmpDir, 'test-run-*.log'), { force: true })
    await rm(join(tmpDir, 'test-multi-run.log'), { force: true })
  } catch (err) {
    // Ignore errors if files don't exist
  }
}

async function runTest(runNumber) {
  const logFile = join(tmpDir, `test-run-${runNumber}.log`)
  const summaryLog = join(tmpDir, 'test-multi-run.log')

  return new Promise((resolve) => {
    console.log(`${colors.cyan}===== Starting Test Run ${runNumber} =====${colors.reset}`)

    // Append to summary log
    appendFile(summaryLog, `===== Starting Test Run ${runNumber} =====\n`).catch(() => {})

    let output = ''

    const proc = spawn('pnpm', ['test-storybook', '--url', 'http://localhost:6006'], {
      cwd: projectRoot,
      shell: true,
    })

    proc.stdout.on('data', (data) => {
      output += data.toString()
    })

    proc.stderr.on('data', (data) => {
      output += data.toString()
    })

    proc.on('close', async (code) => {
      // Write full output to log file
      await writeFile(logFile, output)

      // Determine result based solely on exit code
      const passed = code === 0
      const result = passed ? 'PASSED' : `FAILED (exit code ${code})`
      const resultColor = passed ? colors.green : colors.red

      const resultLine = `Run ${runNumber}: ${result}`
      console.log(`${resultColor}${resultLine}${colors.reset}`)

      // Append to summary log
      await appendFile(summaryLog, `${resultLine}\n`)

      resolve({
        runNumber,
        result,
        passed,
      })
    })
  })
}

async function main() {
  console.log(`${colors.cyan}Running ${numRuns} test iterations...${colors.reset}\n`)

  await setup()

  const results = []

  for (let i = 1; i <= numRuns; i++) {
    const result = await runTest(i)
    results.push(result)
  }

  // Print summary
  console.log(`\n${colors.cyan}===== Summary =====${colors.reset}`)

  const passCount = results.filter(r => r.passed).length
  const failCount = results.length - passCount

  results.forEach(r => {
    const color = r.passed ? colors.green : colors.red
    console.log(`${color}Run ${r.runNumber}: ${r.result}${colors.reset}`)
  })

  console.log(`\n${colors.cyan}Total: ${passCount}/${numRuns} passed${colors.reset}`)

  // Append summary to log
  const summaryLog = join(tmpDir, 'test-multi-run.log')
  await appendFile(summaryLog, `\n===== Summary =====\n`)
  results.forEach(r => {
    appendFile(summaryLog, `Run ${r.runNumber}: ${r.result}\n`)
  })
  await appendFile(summaryLog, `\nTotal: ${passCount}/${numRuns} passed\n`)

  console.log(`\n${colors.cyan}Logs saved to: ${tmpDir}${colors.reset}`)

  // Exit with appropriate code
  process.exit(failCount > 0 ? 1 : 0)
}

main().catch(err => {
  console.error(`${colors.red}Error: ${err.message}${colors.reset}`)
  process.exit(1)
})
