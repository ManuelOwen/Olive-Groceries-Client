import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import type { AnyFieldApi } from '@tanstack/react-form'
import { useLoginUser } from '@/hooks/useUser'
import { useAuthStore } from '@/stores/authStore'
import { Toaster, toast } from 'sonner'
import bgImage from '@/images/basket.jpg';

export const Route = createFileRoute('/login')({
  component: RouteComponent,
})

function FieldInfo({ field }: { field: AnyFieldApi }) {
  return (
    <>
      {field.state.meta.isTouched && !field.state.meta.isValid ? (
        <em className="text-red-500 text-sm">
          {field.state.meta.errors.join(', ')}
        </em>
      ) : null}
      {field.state.meta.isValidating ? (
        <span className="text-blue-500 text-sm">Validating...</span>
      ) : null}
    </>
  )
}

function RouteComponent() {
  // Use the mutation hook for user login
  const loginUserMutation = useLoginUser()

  // Get auth store for debugging
  const authStore = useAuthStore()

  // Use navigate hook for programmatic navigation
  const navigate = useNavigate()

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      try {
        console.log('Submitting login form with data:', value)

        // Call the mutation to login the user
        const result = await loginUserMutation.mutateAsync(value)
        console.log('User logged in successfully:', result)

        // Set user and token in auth store
        if (typeof result.token === 'string') {
          authStore.login(result, result.token)
        } else {
          throw new Error('Login failed: No token returned from server.')
        }

        // Reset form after successful login
        form.reset()

        // Navigate based on user role from the login result
        const userRole = result?.role
        console.log('Navigating user with role:', userRole)

        if (userRole === 'admin') {
          navigate({ to: '/admin/dashboard' })
        } else if (userRole === 'user') {
          navigate({ to: '/user/dashboard' })
        } else if (userRole === 'driver') {
          navigate({ to: '/driver/dashboard' })
        } else {
          // Default to products if role is undefined or unknown
          navigate({ to: '/products' })
        }

        // Show success toast
        toast.success('Login successful!', {
          description: 'Welcome back! You have been logged in successfully.',
          duration: 4000,
        })
      } catch (error) {
        console.error('Login failed:', error)
        console.log('Error details:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          error: error,
        })

        // Check if the error is due to invalid credentials
        const errorMessage =
          error instanceof Error ? error.message : 'Login failed'

        if (
          errorMessage.includes('Invalid') ||
          errorMessage.includes('credentials') ||
          errorMessage.includes('password') ||
          errorMessage.includes('email')
        ) {
          toast.error('Invalid credentials', {
            description:
              'The email or password you entered is incorrect. Please try again.',
            duration: 5000,
          })
        } else if (
          errorMessage.includes('not found') ||
          errorMessage.includes('does not exist')
        ) {
          toast.error('Account not found', {
            description:
              'No account found with this email address. Please check your email or sign up.',
            duration: 5000,
          })
        } else {
          // Show generic error toast for other errors
          toast.error('Login failed', {
            description: errorMessage,
            duration: 5000,
          })
        }
      }
    },
  })

  return (
    <>
      <Toaster position="top-right" richColors closeButton />
      <div className="relative min-h-screen flex items-center justify-center bg-orange-50 px-4 overflow-hidden">
        {/* Background image */}
        <img
          src={bgImage}
          alt="Basket of groceries"
          className="absolute inset-0 w-full h-full object-cover opacity-20 z-0"
        />
        {/* Overlay for readability */}
        <div className="absolute inset-0 bg-white/60 z-10" />
        {/* Main content with card and animation side by side on desktop */}
        <div className="relative z-20 flex flex-col md:flex-row items-center justify-center w-full max-w-3xl">
          {/* Login Card */}
          <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-lg border border-orange-200 md:mr-8">
            <h3 className="text-orange-400 font-italic mb-2">
              Welcome back 😊 to Olive Groceries
            </h3>
            <h1 className="text-2xl font-bold text-orange-500 mb-6 text-center">
              Login
            </h1>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                e.stopPropagation()
                form.handleSubmit()
              }}
              className="space-y-5"
            >
              {/* Email */}
              <div>
                <form.Field
                  name="email"
                  validators={{
                    onChange: ({ value }) =>
                      !value
                        ? 'Email is required'
                        : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
                          ? 'Please enter a valid email address'
                          : undefined,
                  }}
                >
                  {(field) => (
                    <>
                      <input
                        id={field.name}
                        name={field.name}
                        type="email"
                        placeholder="Email"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className="w-full px-4 py-2 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                      />
                      <FieldInfo field={field} />
                    </>
                  )}
                </form.Field>
              </div>

              {/* Password */}
              <div>
                <form.Field
                  name="password"
                  validators={{
                    onChange: ({ value }) =>
                      !value
                        ? 'Password is required'
                        : value.length < 8
                          ? 'Password must be at least 8 characters'
                          : undefined,
                  }}
                >
                  {(field) => (
                    <>
                      <input
                        id={field.name}
                        name={field.name}
                        type="password"
                        placeholder="Password"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className="w-full px-4 py-2 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                      />
                      <FieldInfo field={field} />
                    </>
                  )}
                </form.Field>
              </div>

              {/* Submit */}
              <form.Subscribe
                selector={(state) => [state.canSubmit, state.isSubmitting]}
              >
                {([canSubmit, isSubmitting]) => (
                  <div className="flex justify-center">
                    <button
                      type="submit"
                      disabled={!canSubmit || loginUserMutation.isPending}
                      className={`w-2/4 py-2 px-4 text-white font-semibold rounded-lg transition cursor-pointer ${
                        canSubmit && !loginUserMutation.isPending
                          ? 'bg-orange-400 hover:bg-orange-500'
                          : 'bg-orange-200 cursor-not-allowed'
                      }`}
                    >
                      {isSubmitting || loginUserMutation.isPending
                        ? 'Logging in...'
                        : 'Login'}
                    </button>
                  </div>
                )}
              </form.Subscribe>

              {/* Sign up link */}
              <div className="text-center mt-4">
                <p className="text-gray-600">
                  Don't have an account?{' '}
                  <Link
                    className="text-orange-400 hover:underline font-semibold"
                    to="/signin"
                  >
                    Sign Up
                  </Link>
                </p>
              </div>
            </form>
          </div>
          {/* Delivery Animation (side on desktop, below on mobile) */}
          <div className="mt-8 md:mt-0 md:ml-8 flex-shrink-0 flex flex-col items-center">
            <svg viewBox="0 0 200 80" width="180" height="80">
              <g>
                <rect x="20" y="40" width="80" height="30" rx="8" fill="#f97316" />
                <rect x="100" y="50" width="50" height="20" rx="5" fill="#fbbf24" />
                <circle cx="40" cy="75" r="10" fill="#444" />
                <circle cx="120" cy="75" r="10" fill="#444" />
                <animateTransform attributeName="transform" type="translate" from="-20 0" to="40 0" dur="2s" repeatCount="indefinite" />
              </g>
            </svg>
            <div className="text-center text-orange-500 font-semibold mt-2 animate-pulse">Join us for a smooth order</div>
          </div>
        </div>
      </div>
    </>
  )
}
