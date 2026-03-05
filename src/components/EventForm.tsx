import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { db } from '../services/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import SuccessTicket from './SuccessTicket';

const formSchema = z.object({
  studentName: z.string().min(2, 'Student Name must be at least 2 characters'),
  contactNumber: z.string().min(10, 'Contact Number must be at least 10 digits'),
  program: z.enum(['MBA', 'Top Up', 'MSc', 'LLM', 'L7']),
  uwlIdNo: z.string().min(1, 'UWL ID No is required'),
  informAdvance: z.literal(true, {
    message: "You must agree to the terms",
  }),
});

type FormData = z.infer<typeof formSchema>;

export default function EventForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [ticketData, setTicketData] = useState<FormData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      informAdvance: true, // Default to true for speed, user can uncheck if they disagree (but form won't submit)
    }
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await addDoc(collection(db, 'registrations'), {
        ...data,
        createdAt: serverTimestamp(),
      });
      setTicketData(data);
      setIsSuccess(true);
      reset();
    } catch (err) {
      console.error("Error submitting form:", err);
      setError("Failed to submit registration. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (isSuccess && ticketData) {
    return <SuccessTicket data={ticketData} onReset={() => {
      setIsSuccess(false);
      setTicketData(null);
    }} />;
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-4 md:p-6">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-[2rem] p-6 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden"
      >
        {/* Decorative shine */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

        <motion.div variants={itemVariants} className="mb-8 text-center">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">Registration</h2>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100/80 border border-slate-200 text-slate-600 text-xs font-semibold shadow-sm">
            <span>📅 28th March 2026</span>
            <span className="w-1 h-1 bg-slate-400 rounded-full"></span>
            <span>📍 ANC Kandy Branch</span>
          </div>
        </motion.div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-6 p-4 bg-red-50/80 backdrop-blur-sm border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 shadow-sm"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </motion.div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Student Name */}
          <motion.div variants={itemVariants} className="space-y-2">
            <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">Student Name</label>
            <input
              {...register('studentName')}
              autoComplete="name"
              className="w-full bg-white/50 border border-slate-200 rounded-xl px-4 py-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all hover:bg-white hover:border-blue-300 shadow-sm"
              placeholder="Enter your full name"
            />
            {errors.studentName && (
              <p className="text-red-500 text-xs ml-1 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3 h-3" /> {errors.studentName.message}
              </p>
            )}
          </motion.div>

          {/* Contact Number */}
          <motion.div variants={itemVariants} className="space-y-2">
            <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">Contact Number</label>
            <input
              {...register('contactNumber')}
              type="tel"
              autoComplete="tel"
              className="w-full bg-white/50 border border-slate-200 rounded-xl px-4 py-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all hover:bg-white hover:border-blue-300 shadow-sm"
              placeholder="Enter your mobile number"
            />
            {errors.contactNumber && (
              <p className="text-red-500 text-xs ml-1 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3 h-3" /> {errors.contactNumber.message}
              </p>
            )}
          </motion.div>

          {/* Program */}
          <motion.div variants={itemVariants} className="space-y-2">
            <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">Program</label>
            <div className="relative">
              <select
                {...register('program')}
                className="w-full bg-white/50 border border-slate-200 rounded-xl px-4 py-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all hover:bg-white hover:border-blue-300 appearance-none cursor-pointer shadow-sm font-medium"
              >
                <option value="" className="text-slate-400">Select your program</option>
                <option value="MBA">MBA</option>
                <option value="Top Up">Top Up</option>
                <option value="MSc">MSc</option>
                <option value="LLM">LLM</option>
                <option value="L7">L7</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </div>
            </div>
            {errors.program && (
              <p className="text-red-500 text-xs ml-1 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3 h-3" /> {errors.program.message}
              </p>
            )}
          </motion.div>

          {/* UWL ID No */}
          <motion.div variants={itemVariants} className="space-y-2">
            <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">UWL ID No</label>
            <input
              {...register('uwlIdNo')}
              className="w-full bg-white/50 border border-slate-200 rounded-xl px-4 py-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all hover:bg-white hover:border-blue-300 shadow-sm font-mono tracking-wide"
              placeholder="Enter your UWL ID"
            />
            {errors.uwlIdNo && (
              <p className="text-red-500 text-xs ml-1 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3 h-3" /> {errors.uwlIdNo.message}
              </p>
            )}
          </motion.div>

          {/* Inform Advance - Checkbox */}
          <motion.div variants={itemVariants} className="space-y-3 pt-2">
            <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 bg-white/50 hover:bg-white transition-colors cursor-pointer group">
              <div className="relative flex items-center mt-0.5">
                <input
                  type="checkbox"
                  {...register('informAdvance')}
                  className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-slate-300 transition-all checked:border-blue-500 checked:bg-blue-500 hover:border-blue-400"
                />
                <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <span className="text-sm font-medium text-slate-600 leading-relaxed group-hover:text-slate-900 transition-colors">
                I agree to inform Ms. Nimesha (077 036 3802) or Ms. Kavya (077 551 0791) in advance if I am unable to participate.
              </span>
            </label>
            {errors.informAdvance && (
              <p className="text-red-500 text-xs ml-1 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3 h-3" /> {errors.informAdvance.message}
              </p>
            )}
          </motion.div>

          <motion.div variants={itemVariants} className="pt-6">
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: "0 20px 40px -10px rgba(59, 130, 246, 0.4)" }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl shadow-xl shadow-slate-900/20 transition-all flex items-center justify-center gap-2 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10 flex items-center gap-2">
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="tracking-wide">REGISTERING...</span>
                  </>
                ) : (
                  <>
                    <span className="tracking-wide">REGISTER NOW</span>
                    <CheckCircle className="w-5 h-5" />
                  </>
                )}
              </div>
            </motion.button>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
}
