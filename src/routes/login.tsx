import { createFileRoute, Link, useNavigate} from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import type { AnyFieldApi } from '@tanstack/react-form'
import { useLoginUser } from '@/hooks/useUser'
import { Toaster, toast } from 'sonner'
import { useAuthStore } from '@/stores/authStore'

export const Route = createFileRoute('/login')({
  component: RouteComponent,
})

function FieldInfo({ field }: { field: AnyFieldApi }) {
  return (
    <>
      {field.state.meta.isTouched && !field.state.meta.isValid ? (
        <em className="text-red-500 text-sm">{field.state.meta.errors.join(', ')}</em>
      ) : null}
      {field.state.meta.isValidating ? <span className="text-blue-500 text-sm">Validating...</span> : null}
    </>
  )
}

function RouteComponent() {
  
  // Use the mutation hook for user login
  const loginUserMutation = useLoginUser();
  
  // Use navigate hook for programmatic navigation
  const navigate = useNavigate();
  // const router = useRouter();
  
  // Use auth store
  const { login, setLoading, setError, clearError } = useAuthStore();

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      try {
        console.log('Submitting login form with data:', value);
        
        // Set loading state
        setLoading(true);
        clearError();
        
        // Call the mutation to login the user
        const result = await loginUserMutation.mutateAsync(value);
        console.log('User logged in successfully:', result);
        console.log('User role from API:', result.user.role);
        console.log('Token from API:', result.token ? 'TOKEN_PRESENT' : 'NO_TOKEN');
        console.log('Full result object:', JSON.stringify(result, null, 2));
        
        // Reset form after successful login
        form.reset();
        
        // Store user data and token in auth store
        login(result.user, result.token);
        
        console.log('User data stored in auth store:', result.user.role);
        console.log('About to redirect based on role:', result.user.role);
        
        // Redirect all users to products page after login
        console.log(`User logged in with role: ${result.user.role}, redirecting to products page`);
        
        // Show success toast first
        toast.success('Login successful!', {
          description: 'Welcome back! You have been logged in successfully.',
          duration: 4000,
        });
        
        // Redirect all users to products page after login
        console.log('Attempting TanStack Router navigation to /products');
        console.log('Current location before navigation:', window.location.href);
        
        // Simple navigation approach
        try {
          console.log('Trying simple navigate...');
          navigate({ to: '/products' });
          console.log('Simple navigate successful');
        } catch (error) {
          console.log('Simple navigate failed:', error);
          
          // Fallback to window.location
          console.log('Using window.location fallback');
          window.location.href = '/products';
        }
        
        // Additional debugging
        setTimeout(() => {
          console.log('Location after navigation attempt:', window.location.href);
        }, 200);
      } catch (error: unknown) {
        console.error('Login failed:', error);
        console.log('Error details:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          error: error
        });
        
        // Set error state in auth store
        const errorMessage = error instanceof Error ? error.message : 'Login failed';
        setError(errorMessage);
        setLoading(false);
        
        if (errorMessage.includes('Invalid') || errorMessage.includes('credentials') || errorMessage.includes('password') || errorMessage.includes('email')) {
          toast.error('Invalid credentials', {
            description: 'The email or password you entered is incorrect. Please try again.',
            duration: 5000,
          });
        } else if (errorMessage.includes('not found') || errorMessage.includes('does not exist')) {
          toast.error('Account not found', {
            description: 'No account found with this email address. Please check your email or sign up.',
            duration: 5000,
          });
        } else {
          // Show generic error toast for other errors
          toast.error('Login failed', {
            description: errorMessage,
            duration: 5000,
          });
        }
      }
    },
  });

  return (
    <>
      <Toaster 
        position="top-right"
        richColors
        closeButton
      />
      <div className="min-h-screen flex items-center justify-center bg-orange-50 px-4">
        <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-lg border border-orange-200">
          <h3 className='text-orange-400 font-italic mb-2'>Welcome back 😊 to Olive Groceries</h3>
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
                    {isSubmitting || loginUserMutation.isPending ? 'Logging in...' : 'Login'}
                  </button>
                </div>
              )}
            </form.Subscribe>
            
            {/* Sign up link */}
            <div className="text-center mt-4">
              <p className="text-gray-600">
                Don't have an account?{' '}
                <Link className="text-orange-400 hover:underline font-semibold" to="/signin">
                  Sign Up
                </Link>
              </p>
            </div>
            
            {/* Test navigation buttons */}
            <div className="text-center mt-2 space-y-2">
              {/* <button
                type="button"
                onClick={() => {
                  console.log('Test navigation to home clicked');
                  navigate({ to: '/' });
                }}
                className="text-blue-500 hover:underline text-sm block"
              >
                Test Navigation to Home
              </button> */}
              {/* <button
                type="button"
                onClick={() => {
                  console.log('Test navigation to products clicked');
                  navigate({ to: '/products' });
                }}
                className="text-blue-500 hover:underline text-sm block"
              >
                Test Navigation to Products
              </button> */}
              {/* <button
                type="button"
                onClick={() => {
                  console.log('Test window.location to products');
                  window.location.href = '/products';
                }}
                className="text-green-500 hover:underline text-sm block"
              >
                Test Window.Location to Products
              </button> */}
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
