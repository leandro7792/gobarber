import * as Yup from 'yup';
import User from '../models/User';

class UserController {
  async store(req, res) {
    const schemaValidations = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string().email(),
      password: Yup.string()
        .required()
        .min(6),
    });

    if (!(await schemaValidations.isValid(req.body))) {
      return res.status(400).json({ error: 'Validações falharam' });
    }

    const userExist = await User.findOne({ where: { email: req.body.email } });

    if (userExist) {
      return res.status(400).json({ error: 'Usuário já existe' });
    }

    const { id, name, email, provider } = await User.create(req.body);

    return res.json({ id, name, email, provider });
  }

  async update(req, res) {
    const schemaValidations = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string(),
      oldPpassword: Yup.string().min(6),
      password: Yup.string()
        .min(6)
        .when('oldPassword', (oldPassword, field) =>
          oldPassword ? field.required() : field
        ),
      confirmPassword: Yup.string().when('password', (password, field) =>
        password ? field.required().oneOf([Yup.ref('password')]) : false
      ),
    });

    if (!(await schemaValidations.isValid(req.body))) {
      return res.status(400).json({ error: 'Validações falharam' });
    }

    const { email, oldPassword } = req.body;

    const user = await User.findByPk(req.userId);

    if (email !== user.email) {
      const userExist = await User.findOne({
        where: { email },
      });

      if (userExist) {
        return res.status(400).json({ error: 'Usuário já existe' });
      }
    }

    if (oldPassword && !(await user.checkPassowrd(oldPassword)))
      return res.status(401).json({ error: 'Senha não confere' });

    const { id, name, provider } = await user.update(req.body);

    return res.json({ id, name, email, provider });
  }
}

export default new UserController();
