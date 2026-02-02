"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import styles from "./Button.module.css";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	label: string;
	variant?: ButtonVariant;
	size?: ButtonSize;
	fullWidth?: boolean;
	isLoading?: boolean;
	leftIcon?: ReactNode;
	rightIcon?: ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	(
		{
			label,
			variant = "primary",
			size = "md",
			fullWidth = false,
			isLoading = false,
			leftIcon,
			rightIcon,
			className,
			disabled,
			...props
		},
		ref,
	) => {
		const classes = [
			styles.button,
			styles[variant],
			styles[size],
			fullWidth ? styles.fullWidth : "",
			isLoading ? styles.loading : "",
			className,
		]
			.filter(Boolean)
			.join(" ");

		return (
			<button
				ref={ref}
				className={classes}
				disabled={disabled || isLoading}
				aria-busy={isLoading}
				{...props}
			>
				{isLoading && <span className={styles.spinner} aria-hidden="true" />}
				{leftIcon && <span className={styles.icon}>{leftIcon}</span>}
				<span className={styles.label}>{label}</span>
				{rightIcon && <span className={styles.icon}>{rightIcon}</span>}
			</button>
		);
	},
);

Button.displayName = "Button";

export default Button;
