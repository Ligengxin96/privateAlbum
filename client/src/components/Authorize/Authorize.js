import React, { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory, withRouter } from 'react-router-dom';
import { Avatar, Button, Paper, Grid, Typography, Container, Snackbar } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import { GoogleLogin } from 'react-google-login';

import { LOGIN } from '../../constants/constantsType';
import Input from './Input/Input';
import GoogleIcon from './GoogleIcon/GoogleIcon';
import { login, register } from '../../actions/authorize';
import { encodeBase64, decodeBase64 } from '../../utils/crypto.js';

import useStyles from './styles';


const Authorize = (props) => {
  const { info } = props.match.params;
  let error = null;
  if (info) {
    error = JSON.parse(decodeBase64(info)).error;
  }

  const classes = useStyles();
  const dispatch = useDispatch();
  const history = useHistory();
  const fromRef = useRef();
  
  const [open, setOpen] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleLoginSuccess, setisGoogleLoginSuccess] = useState(true);
  const [alertText, setAlertText] = useState('');
  const [isTokenExpired, setisTokenExpired] = useState(!!error);
  const [errorText, setErrorText] = useState(null);
  const [formValues, setFormValues] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' });

  const handleShowPassword = () => setShowPassword(!showPassword);

  const handleInputChange = (e) => setFormValues({ ...formValues, [e.target.name]: e.target.value });

  const switchMode = () => {
    setShowPassword(false);
    setIsRegister(prevIsRegister => !prevIsRegister);
    fromRef.current.reset();
  }

  const googleSuccess = async (res) => {
    setOpen(true);
    setisGoogleLoginSuccess(true);
    setAlertText('Google 账户登录成功');
    setTimeout(() => {
      try {
        setisTokenExpired(false);
        dispatch({ type: LOGIN, payload: { ...res.profileObj, token: res.tokenId } });
        history.push('/');
      } catch (error) {
        console.error(error);
      }
    }, 1000);
  };

  const googleError = (error) => {
    console.error(`Google acount login failed with error: ${JSON.stringify(error)}`);
    setOpen(true);
    setisGoogleLoginSuccess(false);
    setAlertText('Google 账户登录失败,请稍后再试');
  };

  const handleClose = (_, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const password = encodeBase64(formValues.password);
    if (isRegister) {
      if (formValues.password !== formValues.confirmPassword) {
        setErrorText('两次输入的密码不一致')
        return;
      }
      dispatch(register({...formValues, password }, history));
    } else {
      dispatch(login({...formValues, password }, history));
    }
  }

  useEffect(() => {
    if (isTokenExpired) {
      setOpen(true);
      setAlertText('身份信息失效,请重新登录');
    }
  }, [isTokenExpired])

  return (
    <Container component='main' maxWidth='xs'>
      <Paper className={classes.paper} elevation={6} >
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component='h1' variant='h5'>{ isRegister ? '注册' : '登录' }</Typography>
        <form className={classes.form} onSubmit={handleSubmit} ref={fromRef} >
          <Grid container spacing={2}>
            { 
              isRegister && (
                <>
                  <Input handleChange={handleInputChange} name='firstName' label='姓氏' autoFocus half />
                  <Input handleChange={handleInputChange} name='lastName' label='名字' half />
                </> 
              )
            }
            <Input handleChange={handleInputChange} name='email' label='邮箱' type='email' />
            <Input handleChange={handleInputChange} handleShowPassword={handleShowPassword} name='password' label='密码' type={showPassword ? 'text' : 'password'} />
            { isRegister && <Input handleChange={handleInputChange} name='confirmPassword' label='确认密码' type='password' errorText={errorText} /> }
          </Grid>
          <Button type='submit' fullWidth variant='contained' color='primary' className={classes.submit}>
            { isRegister ? '注册' : '登录' }
          </Button>
          <GoogleLogin
            clientId='160069951274-9lk4icl4nvv4lbb61umon883c3rb6dtf.apps.googleusercontent.com'
            render={(renderProps) => (
              <Button onClick={renderProps.onClick} disabled={renderProps.disabled} className={classes.googleButton} fullWidth color='primary' startIcon={<GoogleIcon />} variant='contained'>
                Google账号登录
              </Button>
            )}
            onSuccess={googleSuccess}
            onFailure={googleError}
            cookiePolicy='single_host_origin'
          />
          <Grid container justify='flex-end'>
            <Grid item>
              <Button onClick={switchMode}>
                { isRegister ? '已经有账号了?去登录' : '还没有账号?去注册' }
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
      <Snackbar open={open} autoHideDuration={2000} onClose={handleClose} anchorOrigin={{ vertical:'top', horizontal: 'center' }}>
        <Alert elevation={6} variant="filled" onClose={handleClose} severity={isGoogleLoginSuccess && !isTokenExpired ? 'success': 'error' } >
          {alertText}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default withRouter(Authorize);
