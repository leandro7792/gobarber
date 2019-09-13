import jwt from 'jsonwebtoken';
import * as Yup from 'yup';

import User from '../models/User';
import authConfig from '../../config/auth';

class SessionConbtroller {
  async store(req, res) {
    const schemaValidations = Yup.object().shape({
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string().required(),
    });

    if (!(await schemaValidations.isValid(req.body))) {
      return res.status(400).json({ error: 'Validações falharam' });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) return res.status(401).json({ error: 'Usuário nao encontrado' });

    if (!(await user.checkPassowrd(password)))
      return res.status(401).json({ error: 'Senha não confere' });

    const { id, name } = user;

    return res.json({
      user: {
        id,
        name,
        email,
      },
      toke: jwt.sign({ id }, authConfig.secret, {
        expiresIn: authConfig.expiresIn,
      }),
    });
  }
}

export default new SessionConbtroller();
