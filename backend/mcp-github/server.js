const express = require('express');
const { Octokit } = require('@octokit/rest');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.GITHUB_MCP_PORT || 4001;

// Middleware
app.use(cors());
app.use(express.json());

// Configurar Octokit (GitHub API)
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
  userAgent: 'SIGA-MCP-GitHub v1.0.0'
});

// Configuración del repositorio
const OWNER = process.env.GITHUB_OWNER || 'PrincipeFelipe';
const REPO = process.env.GITHUB_REPO || 'SIGA';

/**
 * Endpoint principal con información del servidor
 */
app.get('/', (req, res) => {
  res.json({
    name: 'GitHub MCP Server',
    version: '1.0.0',
    description: 'Servidor MCP para gestión del repositorio GitHub del Sistema SIGA',
    repository: `${OWNER}/${REPO}`,
    endpoints: {
      health: 'GET /health',
      repoInfo: 'GET /repo',
      branches: 'GET /branches',
      commits: 'GET /commits',
      issues: 'GET /issues',
      pullRequests: 'GET /pulls',
      createIssue: 'POST /issue',
      createBranch: 'POST /branch',
      fileContent: 'GET /file/:path',
      createFile: 'POST /file',
      updateFile: 'PUT /file',
      deleteFile: 'DELETE /file/:path'
    }
  });
});

/**
 * Health Check
 */
app.get('/health', async (req, res) => {
  try {
    // Verificar conexión con GitHub API
    const { data } = await octokit.rest.users.getAuthenticated();
    
    res.json({
      status: 'healthy',
      github: 'connected',
      user: data.login,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      github: 'disconnected',
      error: error.message
    });
  }
});

/**
 * Obtener información del repositorio
 * GET /repo
 */
app.get('/repo', async (req, res) => {
  try {
    const { data } = await octokit.rest.repos.get({
      owner: OWNER,
      repo: REPO
    });

    res.json({
      success: true,
      data: {
        name: data.name,
        full_name: data.full_name,
        description: data.description,
        private: data.private,
        default_branch: data.default_branch,
        language: data.language,
        created_at: data.created_at,
        updated_at: data.updated_at,
        stars: data.stargazers_count,
        watchers: data.watchers_count,
        forks: data.forks_count,
        open_issues: data.open_issues_count,
        url: data.html_url
      }
    });
  } catch (error) {
    console.error('Error obteniendo info del repositorio:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Listar ramas del repositorio
 * GET /branches
 */
app.get('/branches', async (req, res) => {
  try {
    const { data } = await octokit.rest.repos.listBranches({
      owner: OWNER,
      repo: REPO
    });

    res.json({
      success: true,
      count: data.length,
      data: data.map(branch => ({
        name: branch.name,
        sha: branch.commit.sha,
        protected: branch.protected
      }))
    });
  } catch (error) {
    console.error('Error listando ramas:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Listar commits recientes
 * GET /commits?limit=10&branch=main
 */
app.get('/commits', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const branch = req.query.branch || 'main';

    const { data } = await octokit.rest.repos.listCommits({
      owner: OWNER,
      repo: REPO,
      sha: branch,
      per_page: limit
    });

    res.json({
      success: true,
      branch: branch,
      count: data.length,
      data: data.map(commit => ({
        sha: commit.sha.substring(0, 7),
        message: commit.commit.message,
        author: commit.commit.author.name,
        date: commit.commit.author.date,
        url: commit.html_url
      }))
    });
  } catch (error) {
    console.error('Error listando commits:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Listar issues
 * GET /issues?state=open&limit=20
 */
app.get('/issues', async (req, res) => {
  try {
    const state = req.query.state || 'open';
    const limit = parseInt(req.query.limit) || 20;

    const { data } = await octokit.rest.issues.listForRepo({
      owner: OWNER,
      repo: REPO,
      state: state,
      per_page: limit
    });

    res.json({
      success: true,
      state: state,
      count: data.length,
      data: data.map(issue => ({
        number: issue.number,
        title: issue.title,
        state: issue.state,
        author: issue.user.login,
        labels: issue.labels.map(l => l.name),
        created_at: issue.created_at,
        updated_at: issue.updated_at,
        url: issue.html_url
      }))
    });
  } catch (error) {
    console.error('Error listando issues:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Listar Pull Requests
 * GET /pulls?state=open&limit=20
 */
app.get('/pulls', async (req, res) => {
  try {
    const state = req.query.state || 'open';
    const limit = parseInt(req.query.limit) || 20;

    const { data } = await octokit.rest.pulls.list({
      owner: OWNER,
      repo: REPO,
      state: state,
      per_page: limit
    });

    res.json({
      success: true,
      state: state,
      count: data.length,
      data: data.map(pr => ({
        number: pr.number,
        title: pr.title,
        state: pr.state,
        author: pr.user.login,
        base: pr.base.ref,
        head: pr.head.ref,
        created_at: pr.created_at,
        updated_at: pr.updated_at,
        url: pr.html_url
      }))
    });
  } catch (error) {
    console.error('Error listando pull requests:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Crear un nuevo issue
 * POST /issue
 * Body: { "title": "...", "body": "...", "labels": ["bug", "enhancement"] }
 */
app.post('/issue', async (req, res) => {
  try {
    const { title, body, labels } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        error: 'El campo "title" es obligatorio'
      });
    }

    const { data } = await octokit.rest.issues.create({
      owner: OWNER,
      repo: REPO,
      title: title,
      body: body || '',
      labels: labels || []
    });

    res.json({
      success: true,
      message: 'Issue creado exitosamente',
      data: {
        number: data.number,
        title: data.title,
        state: data.state,
        url: data.html_url
      }
    });
  } catch (error) {
    console.error('Error creando issue:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Crear una nueva rama
 * POST /branch
 * Body: { "branch": "feature/nueva-funcionalidad", "from": "main" }
 */
app.post('/branch', async (req, res) => {
  try {
    const { branch, from } = req.body;

    if (!branch) {
      return res.status(400).json({
        success: false,
        error: 'El campo "branch" es obligatorio'
      });
    }

    const fromBranch = from || 'main';

    // Obtener SHA de la rama base
    const { data: refData } = await octokit.rest.git.getRef({
      owner: OWNER,
      repo: REPO,
      ref: `heads/${fromBranch}`
    });

    // Crear nueva rama
    const { data } = await octokit.rest.git.createRef({
      owner: OWNER,
      repo: REPO,
      ref: `refs/heads/${branch}`,
      sha: refData.object.sha
    });

    res.json({
      success: true,
      message: 'Rama creada exitosamente',
      data: {
        branch: branch,
        from: fromBranch,
        sha: data.object.sha
      }
    });
  } catch (error) {
    console.error('Error creando rama:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Obtener contenido de un archivo
 * GET /file/:path?branch=main
 */
app.get('/file/*', async (req, res) => {
  try {
    const filePath = req.params[0];
    const branch = req.query.branch || 'main';

    const { data } = await octokit.rest.repos.getContent({
      owner: OWNER,
      repo: REPO,
      path: filePath,
      ref: branch
    });

    if (data.type !== 'file') {
      return res.status(400).json({
        success: false,
        error: 'La ruta especificada no es un archivo'
      });
    }

    res.json({
      success: true,
      data: {
        path: data.path,
        name: data.name,
        size: data.size,
        sha: data.sha,
        content: Buffer.from(data.content, 'base64').toString('utf-8'),
        encoding: data.encoding,
        url: data.html_url
      }
    });
  } catch (error) {
    console.error('Error obteniendo archivo:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Crear un nuevo archivo
 * POST /file
 * Body: { "path": "...", "content": "...", "message": "...", "branch": "main" }
 */
app.post('/file', async (req, res) => {
  try {
    const { path, content, message, branch } = req.body;

    if (!path || !content || !message) {
      return res.status(400).json({
        success: false,
        error: 'Los campos "path", "content" y "message" son obligatorios'
      });
    }

    const { data } = await octokit.rest.repos.createOrUpdateFileContents({
      owner: OWNER,
      repo: REPO,
      path: path,
      message: message,
      content: Buffer.from(content).toString('base64'),
      branch: branch || 'main'
    });

    res.json({
      success: true,
      message: 'Archivo creado exitosamente',
      data: {
        path: data.content.path,
        sha: data.content.sha,
        commit: data.commit.sha.substring(0, 7),
        url: data.content.html_url
      }
    });
  } catch (error) {
    console.error('Error creando archivo:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Actualizar un archivo existente
 * PUT /file
 * Body: { "path": "...", "content": "...", "message": "...", "sha": "...", "branch": "main" }
 */
app.put('/file', async (req, res) => {
  try {
    const { path, content, message, sha, branch } = req.body;

    if (!path || !content || !message || !sha) {
      return res.status(400).json({
        success: false,
        error: 'Los campos "path", "content", "message" y "sha" son obligatorios'
      });
    }

    const { data } = await octokit.rest.repos.createOrUpdateFileContents({
      owner: OWNER,
      repo: REPO,
      path: path,
      message: message,
      content: Buffer.from(content).toString('base64'),
      sha: sha,
      branch: branch || 'main'
    });

    res.json({
      success: true,
      message: 'Archivo actualizado exitosamente',
      data: {
        path: data.content.path,
        sha: data.content.sha,
        commit: data.commit.sha.substring(0, 7),
        url: data.content.html_url
      }
    });
  } catch (error) {
    console.error('Error actualizando archivo:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Eliminar un archivo
 * DELETE /file/:path
 * Body: { "message": "...", "sha": "...", "branch": "main" }
 */
app.delete('/file/*', async (req, res) => {
  try {
    const filePath = req.params[0];
    const { message, sha, branch } = req.body;

    if (!message || !sha) {
      return res.status(400).json({
        success: false,
        error: 'Los campos "message" y "sha" son obligatorios'
      });
    }

    const { data } = await octokit.rest.repos.deleteFile({
      owner: OWNER,
      repo: REPO,
      path: filePath,
      message: message,
      sha: sha,
      branch: branch || 'main'
    });

    res.json({
      success: true,
      message: 'Archivo eliminado exitosamente',
      data: {
        commit: data.commit.sha.substring(0, 7)
      }
    });
  } catch (error) {
    console.error('Error eliminando archivo:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🔌 Servidor MCP GitHub iniciado correctamente`);
  console.log(`${'='.repeat(60)}`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`📦 Repositorio: ${OWNER}/${REPO}`);
  console.log(`🔑 Token: ${process.env.GITHUB_TOKEN ? '✅ Configurado' : '❌ No configurado'}`);
  console.log(`${'='.repeat(60)}\n`);
});

// Manejo de cierre graceful
process.on('SIGINT', () => {
  console.log('\n⏹️  Cerrando servidor MCP GitHub...');
  console.log('✅ Servidor cerrado correctamente');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n⏹️  Cerrando servidor MCP GitHub...');
  console.log('✅ Servidor cerrado correctamente');
  process.exit(0);
});
