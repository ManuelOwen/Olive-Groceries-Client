import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import type { AnyFieldApi } from '@tanstack/react-form'
import { useCreateUser } from '@/hooks/useUser'
import { Toaster, toast } from 'sonner'
import { useAuthStore } from '@/stores/authStore'

export const Route = createFileRoute('/signin')({
  component: RouteComponent,
})

function FieldInfo({ field }: { field: AnyFieldApi }) {
  return (
    <>
      {field.state.meta.isTouched && !field.state.meta.isValid ? (
        <em>{field.state.meta.errors.join(', ')}</em>
      ) : null}
      {field.state.meta.isValidating ? 'Validating...' : null}
    </>
  )
}

function RouteComponent() {
  
  // Use the mutation hook for user registration
  const createUserMutation = useCreateUser();
  
  // Use navigate hook for programmatic navigation
  const navigate = useNavigate();
  
  // Use auth store
  const { login, setLoading, setError, clearError } = useAuthStore();

  const form = useForm({
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      address: '',
      phoneNumber: '',
    },
    onSubmit: async ({ value }) => {
      try {
        console.log('Submitting form with data:', value);
        
        // Set loading state
        setLoading(true);
        clearError();
        
        // Call the mutation to register the user
        const result = await createUserMutation.mutateAsync(value);
        console.log('User registered successfully:', result);
        
        // Reset form after successful registration
        form.reset();
        
        // Store user data in auth store (registration doesn't return a token)
        login(result, '');
        
        // Redirect all users to products page after signup
        navigate({ to: '/products' });

        // Show success toast
        toast.success('Registration successful!', {
          description: 'Welcome! Your account has been created successfully.',
          duration: 4000,
        });
      } catch (error) {
        console.error('Registration failed:', error);
        console.log('Error details:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          error: error
        });
        
        // Set error state in auth store
        const errorMessage = error instanceof Error ? error.message : 'Registration failed';
        setError(errorMessage);
        setLoading(false);
        
        if (errorMessage.includes('already exists') || errorMessage.includes('duplicate') || errorMessage.includes('email')) {
          toast.error('User already exists', {
            description: 'An account with this email already exists. Please use different credentials.',
            duration: 5000,
          });
        } else {
          // Show generic error toast for other errors
          toast.error('Registration failed', {
            description: errorMessage,
            duration: 5000,
          });
        }
      }
    },
  })
// return component
 
return (
  <>
    <Toaster 
      position="top-right"
      richColors
      closeButton
    />
    <div className="min-h-screen flex items-center justify-center bg-orange-50 px-4">
    <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-lg border border-orange-200">
      <h3 className='text-orange-400 font-italic mb-2'>Hello 😘,welcome to Olive Groceries</h3>
      <h1 className="text-2xl font-bold text-orange-500 mb-6 text-center">
        Sign Up
      </h1>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
        className="space-y-5"
      >
        {/* Full Name */}
        <div>
          <form.Field
            name="fullName"
            validators={{
              onChange: ({ value }) =>
                !value
                  ? 'A full name is required'
                  : value.length < 3
                    ? 'Full name must be at least 3 characters'
                    : undefined,
              onChangeAsyncDebounceMs: 500,
              onChangeAsync: async ({ value }) => {
                await new Promise((resolve) => setTimeout(resolve, 1000))
                return value.includes('error') ? 'No "error" allowed in full name' : undefined
              },
            }}
          >
            {(field) => (
              <>
                <input
                  id={field.name}
                  name={field.name}
                  placeholder="Full Name"
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

        {/* Address */}
        <div>
          <form.Field
            name="address"
            validators={{
              onChange: ({ value }) =>
                !value
                  ? 'Address is required'
                  : value.length < 10
                    ? 'Address must be at least 10 characters'
                    : undefined,
            }}
          >
            {(field) => (
              <>
                <input
                  id={field.name}
                  name={field.name}
                  placeholder="Address"
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

        {/* Phone Number */}
        <div>
          <form.Field
            name="phoneNumber"
            validators={{
              onChange: ({ value }) =>
                !value
                  ? 'Phone number is required'
                  : !/^\+?[\d\s\-()]{10,15}$/.test(value)
                    ? 'Please enter a valid phone number'
                    : undefined,
            }}
          >
            {(field) => (
              <>
                <input
                  id={field.name}
                  name={field.name}
                  type="tel"
                  placeholder="Phone Number"
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
        <div className="flex justify-center">
  <form.Subscribe
    selector={(state) => [state.canSubmit, state.isSubmitting]}
  >
    {([canSubmit, isSubmitting]) => (
      <button
        type="submit"
        disabled={!canSubmit || createUserMutation.isPending}
        className={`w-2/4 py-2 px-4 text-white font-semibold rounded-lg transition cursor-pointer ${
          canSubmit && !createUserMutation.isPending
            ? 'bg-orange-400 hover:bg-orange-500'
            : 'bg-orange-200 cursor-not-allowed'
        }`}
      >
        {isSubmitting || createUserMutation.isPending ? 'Registering...' : 'Sign Up'}
      </button>
    )}
  </form.Subscribe>
</div>

        <h3>Already Have an Account?   <Link className="text-orange-400 hover:underline" to="/login">Login</Link></h3>
      </form>
    </div>
  </div>
  </>
)

}
