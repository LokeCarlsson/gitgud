import jwt from 'jsonwebtoken'
import Github from '../models/githubModel'
import config from '../config/main'
import passport from 'passport'
import passportService from '../config/passport'

const generateToken = (user) => {
  return jwt.sign(user, config.secret, {
    expiresIn: 604800
  })
}

const setUserInfo = (request) => {
  return {
    displayName: request.displayName,
    username: request.username,
    profileUrl: request.profileUrl,
    avatarUrl: request._json.avatar_url,
    bio: request._json.bio,
    githubToken: request._json.githubToken,
    email: request._json.email
  }
}

export const register = (req, res, next) => {
  const displayName = req.user.displayName
  const username = req.user.username
  const profileUrl = req.user.profileUrl
  const avatarUrl = req.user._json.avatar_url
  const bio = req.user._json.bio
  const email = req.user._json.email
  const githubToken = req.user.token

  const userScheme = setUserInfo(req.user)

  Github.findOne({
    username: username
  }, (err, existingUser) => {
    if (err)
      return next(err)

    if (existingUser) {
      const userInfo = setUserInfo(req.user)
      res.redirect(config.client_url + '/login/?username=' + username +
      '&token=' + `JWT ${generateToken(userInfo)}`)
    }

    let githubUser = new Github({
      displayName: displayName,
      username: username,
      profileUrl: profileUrl,
      avatarUrl: avatarUrl,
      bio: bio,
      githubToken: githubToken,
      email: email
    })

    githubUser.save((err, user) => {
      if (err)
        return next(err)

      const userInfo = setUserInfo(req.user)
      res.redirect(config.client_url + '/login/?username=' + username +
      '&token=' + `JWT ${generateToken(userInfo)}`)
    })
  })
}

export const login = (req, res) => {
  const userInfo = setUserInfo(req.user)

  res.redirect(config.client_url + '/?token=' + 
  `JWT ${generateToken(userInfo)}`)

  // res.status(200).json({
  //   token: `JWT ${generateToken(userInfo)}`,
  //   user: userInfo
  // })
}

