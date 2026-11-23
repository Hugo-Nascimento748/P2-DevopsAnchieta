import { Router } from 'express'
import { cadastrar, login } from '../controllers/authController'
import { autenticar } from '../middlewares/authMiddleware'

const router = Router()
router.post('/cadastro', cadastrar)
router.post('/login', login)
router.get('/perfil', autenticar, (_req, res) => {
  res.status(200).json({
    mensagem: 'Acesso autorizado!',
    usuario: res.locals.usuario,
  })
})

export default router
