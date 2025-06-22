import React, { useState, forwardRef } from 'react';
import {
  TextField,
  InputAdornment,
  IconButton,
  TextFieldProps,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

interface PasswordFieldProps extends Omit<TextFieldProps, 'type'> {
  // Дополнительные пропы при необходимости
}

const PasswordField = forwardRef<HTMLDivElement, PasswordFieldProps>(
  ({ InputProps, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    const handleClickShowPassword = () => {
      setShowPassword(!showPassword);
    };

    const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
    };

    return (
      <TextField
        {...props}
        ref={ref}
        type={showPassword ? 'text' : 'password'}
        InputProps={{
          ...InputProps,
          endAdornment: (
            <>
              {InputProps?.endAdornment}
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleClickShowPassword}
                  onMouseDown={handleMouseDownPassword}
                  edge="end"
                  size="small"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            </>
          ),
        }}
      />
    );
  }
);

PasswordField.displayName = 'PasswordField';

export default PasswordField; 